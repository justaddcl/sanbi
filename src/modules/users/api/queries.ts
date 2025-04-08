import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { validate as uuidValidate } from "uuid";

export const useUserQuery = () => {
  const { userId, isLoaded: isAuthLoaded } = useAuth();

  const isQueryEnabled = isAuthLoaded && !!userId && uuidValidate(userId);

  const user = api.user.getUser.useQuery(
    {
      userId: userId ?? "", // using non-null assertion as the query will not be enabled if the userId is null
    },
    {
      enabled: isQueryEnabled && !!userId,
    },
  );

  return { ...user, isAuthLoaded };
};
