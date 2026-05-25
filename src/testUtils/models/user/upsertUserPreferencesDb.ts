export const createUpsertUserPreferencesDb = (updatedPreference: unknown) => {
  const returning = jest
    .fn()
    .mockResolvedValue(updatedPreference ? [updatedPreference] : []);
  const onConflictDoUpdate = jest.fn(() => ({ returning }));
  const values = jest.fn(() => ({ onConflictDoUpdate }));
  const insert = jest.fn(() => ({ values }));

  return {
    db: { insert },
    insert,
    values,
    onConflictDoUpdate,
    returning,
  };
};
