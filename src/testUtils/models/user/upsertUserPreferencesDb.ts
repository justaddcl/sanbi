export const createUpsertUserPreferencesDb = (updatedPreference: unknown) => {
  const findFirst = jest.fn().mockResolvedValue({
    id: "user_123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    onboardingStep: "createTeam",
    onboardingCompletedAt: null,
    authDeletedAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });
  const returning = jest
    .fn()
    .mockResolvedValue(updatedPreference ? [updatedPreference] : []);
  const onConflictDoUpdate = jest.fn(() => ({ returning }));
  const values = jest.fn(() => ({ onConflictDoUpdate }));
  const insert = jest.fn(() => ({ values }));

  return {
    db: {
      query: {
        users: {
          findFirst,
        },
      },
      insert,
    },
    findFirst,
    insert,
    values,
    onConflictDoUpdate,
    returning,
  };
};
