import { eq } from "drizzle-orm";

import {
  ClerkUserSyncError,
  createSanbiUserFromClerkUser,
  markSanbiUserAuthDeleted,
  syncSanbiUserFromClerkUser,
} from "@server/auth/clerkUserSync";
import { userPreferences, users } from "@server/db/schema";

const userId = "user_123";

const createSyncUserDb = (syncedUser: unknown) => {
  const userReturning = jest.fn().mockResolvedValue([syncedUser]);
  const userOnConflictDoUpdate = jest.fn(() => ({
    returning: userReturning,
  }));
  const userValues = jest.fn(() => ({
    onConflictDoUpdate: userOnConflictDoUpdate,
  }));

  const preferenceOnConflictDoNothing = jest.fn();
  const preferenceValues = jest.fn(() => ({
    onConflictDoNothing: preferenceOnConflictDoNothing,
  }));

  const insert = jest
    .fn()
    .mockReturnValueOnce({ values: userValues })
    .mockReturnValueOnce({ values: preferenceValues });

  return {
    db: { insert },
    insert,
    userValues,
    userOnConflictDoUpdate,
    userReturning,
    preferenceValues,
    preferenceOnConflictDoNothing,
  };
};

const createMarkDeletedDb = (deletedUser: unknown) => {
  const returning = jest
    .fn()
    .mockResolvedValue(deletedUser ? [deletedUser] : []);
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

describe("clerkUserSync", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("creates an upsertable Sanbi user from Clerk user fields", () => {
    expect(
      createSanbiUserFromClerkUser({
        id: userId,
        primaryEmailAddress: { emailAddress: " ADA@Example.COM " },
        firstName: " Ada ",
        lastName: " Lovelace ",
      }),
    ).toEqual({
      id: userId,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      onboardingStep: "createTeam",
    });
  });

  it("uses the webhook primary email id when syncing webhook payloads", () => {
    expect(
      createSanbiUserFromClerkUser({
        id: userId,
        primary_email_address_id: "email_primary",
        email_addresses: [
          { id: "email_secondary", email_address: "secondary@example.com" },
          { id: "email_primary", email_address: "primary@example.com" },
        ],
        first_name: "Ada",
        last_name: "Lovelace",
      }),
    ).toMatchObject({
      email: "primary@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
    });
  });

  it("allows nullable Clerk name fields", () => {
    expect(
      createSanbiUserFromClerkUser({
        id: userId,
        primaryEmailAddress: { emailAddress: "ada@example.com" },
        firstName: "",
        lastName: null,
      }),
    ).toMatchObject({
      firstName: null,
      lastName: null,
    });
  });

  it("does not write anything when Clerk user email is missing", async () => {
    const insert = jest.fn();

    await expect(
      syncSanbiUserFromClerkUser({
        database: { insert } as never,
        clerkUser: { id: userId },
      }),
    ).rejects.toBeInstanceOf(ClerkUserSyncError);

    expect(insert).not.toHaveBeenCalled();
  });

  it("upserts the Sanbi user and creates default preferences idempotently", async () => {
    const updatedAt = new Date("2026-06-01T12:00:00Z");
    const syncedUser = {
      id: userId,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      onboardingStep: "createTeam",
      onboardingCompletedAt: null,
      authDeletedAt: null,
      createdAt: updatedAt,
      updatedAt,
    };
    const db = createSyncUserDb(syncedUser);

    jest.useFakeTimers().setSystemTime(updatedAt);

    await expect(
      syncSanbiUserFromClerkUser({
        database: db.db as never,
        clerkUser: {
          id: userId,
          primaryEmailAddress: { emailAddress: "ADA@example.com" },
          firstName: "Ada",
          lastName: "Lovelace",
        },
      }),
    ).resolves.toEqual(syncedUser);

    expect(db.insert).toHaveBeenNthCalledWith(1, users);
    expect(db.userValues).toHaveBeenCalledWith({
      id: userId,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      onboardingStep: "createTeam",
    });
    expect(db.userOnConflictDoUpdate).toHaveBeenCalledWith({
      target: users.id,
      set: {
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        authDeletedAt: null,
        updatedAt,
      },
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

  it("marks a Sanbi user as auth-deleted without deleting product data", async () => {
    const deletedAt = new Date("2026-06-01T12:00:00Z");
    const deletedUser = {
      id: userId,
      email: `${userId}@deleted.sanbi.invalid`,
      firstName: null,
      lastName: null,
      authDeletedAt: deletedAt,
    };
    const db = createMarkDeletedDb(deletedUser);

    await expect(
      markSanbiUserAuthDeleted({
        database: db.db as never,
        userId,
        deletedAt,
      }),
    ).resolves.toEqual(deletedUser);

    expect(db.update).toHaveBeenCalledWith(users);
    expect(db.set).toHaveBeenCalledWith({
      email: `${userId}@deleted.sanbi.invalid`,
      firstName: null,
      lastName: null,
      authDeletedAt: deletedAt,
      updatedAt: deletedAt,
    });
    expect(db.where).toHaveBeenCalledWith(eq(users.id, userId));
  });
});
