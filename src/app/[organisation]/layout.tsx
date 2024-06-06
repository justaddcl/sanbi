import { startCase } from "@/lib/string";

export default function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    organisation: string;
  };
}) {
  const organisationName = startCase(params.organisation);
  return (
    <main className="container px-4 pb-16">
      <nav className="flex h-[60px] items-center text-slate-700">
        Sanbi // {organisationName}
      </nav>
      {children}
    </main>
  );
}
