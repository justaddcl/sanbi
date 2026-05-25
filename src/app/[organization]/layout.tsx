import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { validate as uuidValidate } from "uuid";

export default async function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{
    organization: string;
  }>;
}) {
  await auth.protect();

  const { organization } = await params;
  const isOrgIdValidUuid = uuidValidate(organization);
  if (!isOrgIdValidUuid) {
    console.error(`Invalid Organization ID: ${organization}`);
    notFound();
  }

  return (
    <main className="grow-1 container flex h-full flex-col px-4 pb-16 pt-8 max-[1025px]:flex-1 lg:px-9 lg:py-6">
      {children}
    </main>
  );
}
