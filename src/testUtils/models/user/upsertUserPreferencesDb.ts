import { createUserFixture } from "./fixtures";

export const createUpsertUserPreferencesDb = (
  updatedPreference: unknown,
  user = createUserFixture(),
) => {
  const findFirst = jest.fn().mockResolvedValue(user);
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
    user,
  };
};
