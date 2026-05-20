import { currentUser } from "@clerk/nextjs/server";
import { createCreateUserDb } from "@testUtils/models/user/createUserDb";
import { createUserPreferencesFixture } from "@testUtils/models/user/fixtures";
import { createUpsertUserPreferencesDb } from "@testUtils/models/user/upsertUserPreferencesDb";
import { eq } from "drizzle-orm";

import { userRouter } from "@server/api/routers/user";
import { userPreferences, users } from "@server/db/schema";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
  currentUser: jest.fn(),
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

  it("creates a default opt-out resource delete confirmation preference for new users", async () => {
    const clerkUser = {
      id: userId,
      firstName: "Ada",
      lastName: "Lovelace",
      primaryEmailAddress: {
        emailAddress: "ada@example.com",
      },
    };
    const createdUser = {
      id: userId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      email: clerkUser.primaryEmailAddress.emailAddress,
    };
    const db = createCreateUserDb(createdUser);
    const caller = createUserRouterCaller(db.db);

    (currentUser as jest.Mock).mockResolvedValue(clerkUser);

    await expect(caller.createMe()).resolves.toEqual([createdUser]);

    expect(db.findFirst).toHaveBeenCalledWith({
      where: eq(users.id, userId),
    });
    expect(db.insert).toHaveBeenNthCalledWith(1, users);
    expect(db.userValues).toHaveBeenCalledWith(createdUser);
    expect(db.userOnConflictDoNothing).toHaveBeenCalledWith({
      target: users.id,
    });
    expect(db.insert).toHaveBeenNthCalledWith(2, userPreferences);
    expect(db.preferenceValues).toHaveBeenCalledWith({
      userId,
      confirmResourceDelete: true,
    });
    expect(db.preferenceOnConflictDoNothing).toHaveBeenCalledWith({
      target: userPreferences.userId,
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
