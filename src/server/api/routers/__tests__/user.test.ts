import { currentUser } from "@clerk/nextjs/server";
import {
  createUserPreferencesFixture,
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { createUpsertUserPreferencesDb } from "@testUtils/models/user/upsertUserPreferencesDb";

import { userRouter } from "@server/api/routers/user";
import { ensureSanbiUserFromClerkSession } from "@server/auth/clerkUserSync";
import { userPreferences } from "@server/db/schema";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
  currentUser: jest.fn(),
}));
jest.mock("@server/auth/clerkUserSync", () => ({
  ClerkUserSyncError: class ClerkUserSyncError extends Error {
    code = "MISSING_PRIMARY_EMAIL";
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

  it("upserts the authenticated user's resource delete confirmation preference", async () => {
    const updatedAt = new Date("2026-05-17T00:00:00Z");
    const updatedPreference = createUserPreferencesFixture({
      userId,
      confirmResourceDelete: false,
    });
    const db = createUpsertUserPreferencesDb(updatedPreference);
    const caller = createUserRouterCaller(db.db);

    jest.useFakeTimers().setSystemTime(updatedAt);

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: updatedPreference.confirmResourceDelete,
      }),
    ).resolves.toEqual(updatedPreference);

    expect(db.insert).toHaveBeenCalledWith(userPreferences);
    expect(db.values).toHaveBeenCalledWith({
      userId,
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
    const db = createUpsertUserPreferencesDb(null);
    const caller = createUserRouterCaller(db.db);

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: false,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
