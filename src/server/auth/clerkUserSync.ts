import { eq } from "drizzle-orm";

import { type NewUser } from "@lib/types";
import { userPreferences, users } from "@server/db/schema";
import { type db as appDb } from "@/server/db";

type SanbiDb = typeof appDb;

type ClerkEmailAddress = {
  id?: string | null;
  emailAddress?: string | null;
  email_address?: string | null;
};

export type SyncableClerkUser = {
  id: string;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
  primary_email_address_id?: string | null;
  emailAddresses?: ClerkEmailAddress[] | null;
  email_addresses?: ClerkEmailAddress[] | null;
};

export class ClerkUserSyncError extends Error {
  constructor(
    message: string,
    public readonly code: "MISSING_PRIMARY_EMAIL",
  ) {
    super(message);
    this.name = "ClerkUserSyncError";
  }
}

const getTrimmedNullableString = (value: string | null | undefined) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
};

const getNormalizedEmail = (email: string | null | undefined) => {
  const trimmedEmail = getTrimmedNullableString(email);
  return trimmedEmail?.toLowerCase() ?? null;
};

const getClerkUserEmailAddresses = (clerkUser: SyncableClerkUser) =>
  clerkUser.emailAddresses ?? clerkUser.email_addresses ?? [];

const getClerkUserPrimaryEmail = (clerkUser: SyncableClerkUser) => {
  const primaryEmailAddress = getNormalizedEmail(
    clerkUser.primaryEmailAddress?.emailAddress,
  );

  if (primaryEmailAddress) {
    return primaryEmailAddress;
  }

  const emailAddresses = getClerkUserEmailAddresses(clerkUser);
  const primaryEmailAddressId = clerkUser.primary_email_address_id;
  const matchingPrimaryEmail = emailAddresses.find(
    (emailAddress) => emailAddress.id === primaryEmailAddressId,
  );

  return getNormalizedEmail(
    matchingPrimaryEmail?.emailAddress ??
      matchingPrimaryEmail?.email_address ??
      emailAddresses[0]?.emailAddress ??
      emailAddresses[0]?.email_address,
  );
};

export const createSanbiUserFromClerkUser = (
  clerkUser: SyncableClerkUser,
): NewUser => {
  const email = getClerkUserPrimaryEmail(clerkUser);

  if (!email) {
    throw new ClerkUserSyncError(
      `Clerk user ${clerkUser.id} does not have a primary email address`,
      "MISSING_PRIMARY_EMAIL",
    );
  }

  return {
    id: clerkUser.id,
    email,
    firstName: getTrimmedNullableString(
      clerkUser.firstName ?? clerkUser.first_name,
    ),
    lastName: getTrimmedNullableString(
      clerkUser.lastName ?? clerkUser.last_name,
    ),
    onboardingStep: "createTeam",
  };
};

export const syncSanbiUserFromClerkUser = async ({
  database,
  clerkUser,
}: {
  database: SanbiDb;
  clerkUser: SyncableClerkUser;
}) => {
  const sanbiUser = createSanbiUserFromClerkUser(clerkUser);
  const updatedAt = new Date();

  const [syncedUser] = await database
    .insert(users)
    .values(sanbiUser)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: sanbiUser.email,
        firstName: sanbiUser.firstName,
        lastName: sanbiUser.lastName,
        authDeletedAt: null,
        updatedAt,
      },
    })
    .returning();

  await database
    .insert(userPreferences)
    .values({
      userId: sanbiUser.id,
      confirmResourceDelete: true,
    })
    .onConflictDoNothing({ target: userPreferences.userId });

  return syncedUser;
};

export const markSanbiUserAuthDeleted = async ({
  database,
  userId,
  deletedAt = new Date(),
}: {
  database: SanbiDb;
  userId: string;
  deletedAt?: Date;
}) => {
  const [deletedUser] = await database
    .update(users)
    .set({
      email: `${userId}@deleted.sanbi.invalid`,
      firstName: null,
      lastName: null,
      authDeletedAt: deletedAt,
      updatedAt: deletedAt,
    })
    .where(eq(users.id, userId))
    .returning();

  return deletedUser ?? null;
};
