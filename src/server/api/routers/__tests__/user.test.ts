import { createUserPreferencesFixture } from "@testUtils/models/user/fixtures";
import { createUpsertUserPreferencesDb } from "@testUtils/models/user/upsertUserPreferencesDb";

import { userRouter } from "@server/api/routers/user";
import { userPreferences } from "@server/db/schema";

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
    jest.useRealTimers();
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

  it("returns NOT_FOUND when the authenticated user's preferences cannot be updated", async () => {
    const db = createUpsertUserPreferencesDb(null);
    const caller = createUserRouterCaller(db.db);

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: false,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
