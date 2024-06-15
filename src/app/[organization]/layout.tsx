import { startCase } from "@lib/string";
import Link from "next/link";
import { redirect } from "next/navigation";

const ORGANIZATION_WHITELIST = ["demo", "stoneway"];

export default function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    organization: string;
  };
}) {
  /** FIXME: primitive redirect while waiting for authentication */
  if (!ORGANIZATION_WHITELIST.includes(params.organization)) {
    redirect("/");
  }

  const organizationName = startCase(params.organization);
  return (
    <main className="container px-4 pb-16">
      <nav className="flex h-[60px] items-center text-slate-700">
        Sanbi //{" "}
        <Link href={`/${params.organization}`}>{organizationName}</Link>
      </nav>
      {children}
    </main>
  );
}
