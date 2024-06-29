import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    organization: string;
  };
}) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, params.organization));

  if (!organization) {
    console.error(`Invalid Organization ID: ${params.organization}`);
    redirect("/");
  }

  return (
    <main className="container px-4 pb-16">
      <nav className="flex h-[60px] items-center text-slate-700">
        <Link href="/">Sanbi</Link> <span>&nbsp;//&nbsp;</span>
        <Link href={`/${params.organization}`}>{organization.name}</Link>
      </nav>
      {children}
    </main>
  );
}
