export const createCreateUserDb = (createdUser: unknown) => {
  const findFirst = jest.fn().mockResolvedValue(null);
  const userReturning = jest.fn().mockResolvedValue([createdUser]);
  const userOnConflictDoNothing = jest.fn(() => ({
    returning: userReturning,
  }));
  const userValues = jest.fn(() => ({
    onConflictDoNothing: userOnConflictDoNothing,
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
    userValues,
    userOnConflictDoNothing,
    userReturning,
    preferenceValues,
    preferenceOnConflictDoNothing,
  };
};
