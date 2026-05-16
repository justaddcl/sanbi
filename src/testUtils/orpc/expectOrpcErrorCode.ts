/**
 * Asserts that a promise rejects with an ORPCError-shaped object and code.
 */
export const expectOrpcErrorCode = async (
  action: Promise<unknown>,
  code: string,
) => {
  await expect(action).rejects.toMatchObject({
    name: "ORPCError",
    code,
  });
};
