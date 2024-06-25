import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
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
