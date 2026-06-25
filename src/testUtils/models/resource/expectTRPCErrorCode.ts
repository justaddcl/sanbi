import { type TRPCError } from "@trpc/server";

export const expectTRPCErrorCode = async (
  action: Promise<unknown>,
  code: TRPCError["code"],
) => {
  await expect(action).rejects.toMatchObject({
    name: "TRPCError",
    code,
  });
};
