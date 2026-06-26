import { Text } from "@/components/Text";
import { CreateTeamForm } from "@/modules/onboarding/createTeam";

export default function CreateTeamPage() {
  return (
    <main>
      <Text style="header-large" className="mb-4 text-center">
        Create a team
      </Text>
      <CreateTeamForm />
    </main>
  );
}
