import { api } from "@/trpc/react";
import { validate as uuidValidate } from "uuid";

export const useUserQuery = (params: { userId: string }) => {
  const { userId } = params;
  return api.user.getUser.useQuery(
    {
      userId: userId,
    },
    {
      enabled: !!userId && uuidValidate(userId),
    },
  );
};
