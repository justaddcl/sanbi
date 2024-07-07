import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  console.log("🖥️ - Test page rendered - user/test page");
  const isTest = Object.keys(searchParams).includes("test");

  console.log(`🖥️ - Test page searchParams - user/test page`, searchParams);
  console.log(
    `🖥️ - Test page searchParams keys - user/test page`,
    Object.keys(searchParams),
  );
  if (isTest) {
    console.log("🖥 - This is a test! - user/test page");
  }

  const apiMessage = await api.user.test("Beep bloop test input");
  return <p>Hi. {apiMessage || "Good bye"}</p>;
}
