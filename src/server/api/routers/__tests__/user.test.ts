import { currentUser } from "@clerk/nextjs/server";
import {
  createUserPreferencesFixture,
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { createUpsertUserPreferencesDb } from "@testUtils/models/user/upsertUserPreferencesDb";

import { userRouter } from "@server/api/routers/user";
import {
  ClerkUserSyncError,
  ensureSanbiUserFromClerkSession,
} from "@server/auth/clerkUserSync";
import { userPreferences } from "@server/db/schema";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
  currentUser: jest.fn(),
}));
jest.mock("@server/auth/clerkUserSync", () => ({
  ClerkUserSyncError: class ClerkUserSyncError extends Error {
    constructor(
      message = "Clerk user sync failed",
      public readonly code = "MISSING_PRIMARY_EMAIL",
    ) {
      super(message);
      this.name = "ClerkUserSyncError";
    }
  },
  ensureSanbiUserFromClerkSession: jest.fn(),
}));
jest.mock("superjson", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@/server/db", () => ({
  db: {},
}));

const userId = "user_123";

const createUserRouterCaller = (db: unknown) =>
  userRouter.createCaller({
    auth: { userId },
    db,
    headers: new Headers(),
  } as never);

describe("userRouter", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("ensures a Sanbi user exists for the authenticated Clerk session", async () => {
    const syncedUser = createUserWithMembershipsFixture({
      id: userId,
      memberships: [],
    });
    const db = {};
    const caller = createUserRouterCaller(db);

    (ensureSanbiUserFromClerkSession as jest.Mock).mockResolvedValue(
      syncedUser,
    );

    await expect(caller.hello()).resolves.toEqual({
      greeting: `Hello ${userId}`,
    });

    expect(currentUser).not.toHaveBeenCalled();
    expect(ensureSanbiUserFromClerkSession).toHaveBeenCalledWith({
      database: db,
      userId,
    });
  });

  it("returns UNAUTHORIZED when the authenticated Sanbi user is auth-deleted", async () => {
    const caller = createUserRouterCaller({});

    (ensureSanbiUserFromClerkSession as jest.Mock).mockRejectedValueOnce(
      new ClerkUserSyncError(
        "Sanbi user is marked as auth-deleted",
        "SANBI_USER_AUTH_DELETED",
      ),
    );

    await expect(caller.hello()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("upserts the authenticated user's resource delete confirmation preference", async () => {
    const updatedAt = new Date("2026-05-17T00:00:00Z");
    const resolvedUser = createUserWithMembershipsFixture({
      id: userId,
      memberships: [],
    });
    const updatedPreference = createUserPreferencesFixture({
      userId: resolvedUser.id,
      confirmResourceDelete: false,
    });
    const db = createUpsertUserPreferencesDb(updatedPreference, resolvedUser);
    const caller = createUserRouterCaller(db.db);

    (ensureSanbiUserFromClerkSession as jest.Mock).mockResolvedValue(
      resolvedUser,
    );
    jest.useFakeTimers().setSystemTime(updatedAt);

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: updatedPreference.confirmResourceDelete,
      }),
    ).resolves.toEqual(updatedPreference);

    expect(db.insert).toHaveBeenCalledWith(userPreferences);
    expect(db.values).toHaveBeenCalledWith({
      userId: resolvedUser.id,
      confirmResourceDelete: updatedPreference.confirmResourceDelete,
    });
    expect(db.onConflictDoUpdate).toHaveBeenCalledWith({
      target: userPreferences.userId,
      set: {
        confirmResourceDelete: updatedPreference.confirmResourceDelete,
        updatedAt,
      },
    });
  });

  it("returns INTERNAL_SERVER_ERROR when the authenticated user's preferences cannot be upserted", async () => {
    const resolvedUser = createUserWithMembershipsFixture({
      id: userId,
      memberships: [],
    });
    const db = createUpsertUserPreferencesDb(null, resolvedUser);
    const caller = createUserRouterCaller(db.db);

    (ensureSanbiUserFromClerkSession as jest.Mock).mockResolvedValue(
      resolvedUser,
    );

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: false,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
