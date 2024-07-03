import { api } from "@/trpc/server";

export default async function CreateTeamPage() {
  const greeting = await api.user.hello({ text: "Hellomst" });

  return (
    <p>
      Create a team. Or don&apos;t. I don&apos;t control you. Also, your mom
      said {greeting ? greeting.greeting : "nothing"}
    </p>
  );
}
