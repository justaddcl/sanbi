import { auth } from "@clerk/nextjs/server";
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

  return (
    <main className="container flex h-full grow flex-col px-4 pt-8 pb-16 max-[1025px]:flex-1 lg:px-9 lg:py-6">
      {children}
    </main>
  );
}
