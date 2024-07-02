import { api } from "@/trpc/server";
import { currentUser } from "@clerk/nextjs/server";

export default async function CreateTeamPage() {
  const user = await currentUser();
  console.log("🚀 ~ CreateTeamPage ~ user:", user);
  const greeting = await api.user.hello({ text: "Hellomst" });

  return (
    <p>
      Create a team. Or don&apos;t. I don&apos;t control you. Also, your mom
      said {greeting ? greeting.greeting : "nothing"}
    </p>
  );
}
