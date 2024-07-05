import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { NEW_USER_SIGN_UP_KEY } from "@app/create-team/consts";

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const shouldCreateNewUser = Object.keys(searchParams).includes(
    NEW_USER_SIGN_UP_KEY as string, // type assertion here since ESLint removes `string` typing on the const
  );

  if (shouldCreateNewUser) {
    try {
      const newUser = await api.user.createMe();
      console.log("User created:", newUser);
    } catch (createUserError) {
      if (createUserError instanceof TRPCError) {
        if (createUserError.code === "CONFLICT") {
          console.info(createUserError.message);
        }
      }
    }
  }

  return <p>Create a team</p>;
}
