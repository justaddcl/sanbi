import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { trpc } from "@lib/trpc/server";
import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";

export default async function Home() {
  const { userId } = auth();

  if (!userId) {
    // FIXME: move query to db/queries
    const [stonewayOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, "Stoneway"));

    if (!stonewayOrg) {
      throw new Error("No organizations.");
    }
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Link href={`${stonewayOrg.id}/`}>賛美 // Sanbi</Link>
      </main>
    );
  }

  const userMembership = await trpc.organizationMemberships.forUser({
    userId,
  });

  if (!userMembership) {
    redirect("/create-team");
  }

  console.log("🚀 ~ [[sign-in]] page ~ userMembership:", userMembership);

  redirect(`/${userMembership?.organizationId}`);
}
