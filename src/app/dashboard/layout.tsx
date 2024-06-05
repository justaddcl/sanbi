export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container px-4 pb-16">
      <nav className="flex h-[60px] items-center text-slate-700">Sanbi</nav>
      {children}
    </main>
  );
}
