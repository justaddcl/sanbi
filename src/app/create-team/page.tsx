import { TRPCError } from "@trpc/server";

import { logger } from "@lib/loggers/logger";
import { trpc } from "@lib/trpc/server";
import { NEW_USER_SIGN_UP_KEY } from "@app/create-team/consts";
import { Text } from "@/components/Text";
import { CreateTeamForm } from "@/modules/onboarding/createTeam";

type CreateTeamPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CreateTeamPage({
  searchParams,
}: CreateTeamPageProps) {
  const resolvedSearchParams = await searchParams;
  const shouldCreateNewUser =
    Object.keys(resolvedSearchParams).includes(NEW_USER_SIGN_UP_KEY);

  if (shouldCreateNewUser) {
    logger.info("🖥 - Should create a new user - create-team page");
    try {
      const newUser = await trpc.user.createMe();
      logger.info("🖥 - User created - create-team page", newUser);
    } catch (createUserError) {
      logger.info(
        "🖥 - Something has gone wrong while creating a user - create-team page",
      );
      if (createUserError instanceof TRPCError) {
        if (createUserError.code === "CONFLICT") {
          logger.info(createUserError.message);
        }
      } else {
        logger.error(createUserError);
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
