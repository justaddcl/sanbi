import { validate as uuidValidate } from "uuid";

import { trpc } from "@lib/trpc";

export const useSetQuery = (params: {
  setId: string;
  organizationId: string;
  userId: string;
}) => {
  const { setId, organizationId, userId } = params;
  return trpc.set.get.useQuery(
    {
      organizationId,
      setId: params.setId,
    },
    {
      enabled: !!userId && uuidValidate(organizationId) && uuidValidate(setId),
    },
  );
};
