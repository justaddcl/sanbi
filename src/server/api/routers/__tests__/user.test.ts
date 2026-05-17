import { userRouter } from "@server/api/routers/user";
import { users } from "@server/db/schema";

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

const createUpdateUsersDb = (updatedUser: unknown) => {
  const returning = jest.fn().mockResolvedValue(updatedUser ? [updatedUser] : []);
  const where = jest.fn(() => ({ returning }));
  const set = jest.fn(() => ({ where }));
  const update = jest.fn(() => ({ set }));

  return {
    db: { update },
    update,
    set,
    where,
    returning,
  };
};

describe("userRouter", () => {
  it("updates the authenticated user's resource delete confirmation preference", async () => {
    const updatedUser = {
      id: userId,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      confirmResourceDelete: false,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const db = createUpdateUsersDb(updatedUser);
    const caller = createUserRouterCaller(db.db);

    await expect(
      caller.updateResourceDeleteConfirmationPreference({
        confirmResourceDelete: false,
      }),
    ).resolves.toEqual(updatedUser);

    expect(db.update).toHaveBeenCalledWith(users);
    expect(db.set).toHaveBeenCalledWith({ confirmResourceDelete: false });
  });

  it("returns NOT_FOUND when the authenticated Sanbi user cannot be updated", async () => {
    const db = createUpdateUsersDb(null);
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
