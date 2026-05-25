"use client";

import { Show, useAuth } from "@clerk/nextjs";

import { GlobalNav } from "@components/GlobalNav";
import { Navbar } from "@components/Navbar";
import { OrganizationHeader } from "@/components/OrganizationHeader";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { userId } = useAuth();
  const gridColumns = userId ? "min-[1025px]:grid-cols-[300px_1fr]" : "";

  return (
    <div className={`min-[1025px]:grid ${gridColumns} min-h-screen`}>
      <Show when="signed-in">
        <div className="hidden rounded-b border border-t-0 border-slate-100 bg-slate-50 min-[1025px]:sticky min-[1025px]:top-0 min-[1025px]:block min-[1025px]:px-8 min-[1025px]:py-6">
          <OrganizationHeader />
          <GlobalNav />
        </div>
      </Show>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
};
