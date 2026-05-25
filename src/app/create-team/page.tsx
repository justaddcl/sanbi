import { TRPCError } from "@trpc/server";

import { trpc } from "@lib/trpc/server";
import { NEW_USER_SIGN_UP_KEY } from "@app/create-team/consts";
import { Text } from "@/components/Text";
import { CreateTeamForm } from "@/modules/onboarding/createTeam";

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const shouldCreateNewUser = Object.keys(resolvedSearchParams).includes(
    NEW_USER_SIGN_UP_KEY,
  );

  if (shouldCreateNewUser) {
    console.log("🖥 - Should create a new user - create-team page");
    try {
      const newUser = await trpc.user.createMe();
      console.log("🖥 - User created - create-team page", newUser);
    } catch (createUserError) {
      console.log(
        "🖥 - Something has gone wrong while creating a user - create-team page",
      );
      if (createUserError instanceof TRPCError) {
        if (createUserError.code === "CONFLICT") {
          console.info(createUserError.message);
        }
      } else {
        console.error(createUserError);
      }
    }
  }

  return (
    <main>
      <Text style="header-large" className="mb-4 text-center">
        Create a team
      </Text>
      <CreateTeamForm />
    </main>
  );
}
