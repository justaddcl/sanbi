import { type Organization } from "@/lib/types";
import { getOrganization } from "@/server/queries";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    console.log(
      "🤖 - userID was not found. Redirecting to sign-in page - organization/layout",
    );
    redirectToSignIn();
  }

  const isOrgIdValidUuid = uuidValidate(params.organization);
  if (!isOrgIdValidUuid) {
    console.error(`Invalid Organization ID: ${params.organization}`);
    notFound();
  }

  return <main className="container px-4 pb-16 pt-8">{children}</main>;
}
