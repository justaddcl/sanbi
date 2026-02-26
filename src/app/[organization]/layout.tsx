import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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
  await auth.protect();

  const isOrgIdValidUuid = uuidValidate(params.organization);
  if (!isOrgIdValidUuid) {
    console.error(`Invalid Organization ID: ${params.organization}`);
    notFound();
  }

  return (
    <main className="grow-1 container flex h-full flex-col px-4 pb-16 pt-8 max-[1025px]:flex-1 lg:px-9 lg:py-6">
      {children}
    </main>
  );
}
