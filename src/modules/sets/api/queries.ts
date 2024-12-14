import { api } from "@/trpc/react";
import { validate as uuidValidate } from "uuid";

export const useSetQuery = (params: {
  setId: string;
  organizationId: string;
  userId: string;
}) => {
  const { setId, organizationId, userId } = params;
  return api.set.get.useQuery(
    {
      organizationId,
      setId: params.setId,
    },
    {
      enabled: !!userId && uuidValidate(organizationId) && uuidValidate(setId),
    },
  );
};
