import { useAuth } from "@clerk/nextjs";
import { validate as uuidValidate } from "uuid";

import { trpc } from "@lib/trpc";

export const useUserQuery = () => {
  const { userId, isLoaded: isAuthLoaded } = useAuth();

  const isQueryEnabled = isAuthLoaded && !!userId && uuidValidate(userId);

  const user = trpc.user.getUser.useQuery(
    {
      userId: userId ?? "", // providing empty string fallback as the query will not be enabled if the userId is null
    },
    {
      enabled: isQueryEnabled && !!userId,
    },
  );

  const userMembership = user.data?.memberships[0];

  return { ...user, isAuthLoaded, userMembership };
};
