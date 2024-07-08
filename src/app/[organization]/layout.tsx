import { db } from "@/server/db";
import { organizationMembers, organizations, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { validate as uuidValidate } from "uuid";

export default async function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    organization: string;
  };
}) {
  const { userId, protect, redirectToSignIn } = auth();
  protect();

  if (!userId) {
    redirectToSignIn();
  }

  const isOrgIdValidUuid = uuidValidate(params.organization);
  if (!isOrgIdValidUuid) {
    notFound();
  }

  // FIXME: this should be moved to an auth api route
  const sanbiUser = await db.query.users.findFirst({
    where: eq(users.id, userId!),
    with: {
      memberships: {
        where: eq(organizationMembers.organizationId, params.organization),
      },
    },
  });

  const isUserPartOfOrg = sanbiUser?.memberships.find(
    (membership) => membership.organizationId === params.organization,
  );

  if (!isUserPartOfOrg) {
    notFound();
  }

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
