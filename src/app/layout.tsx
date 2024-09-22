import "@/styles/globals.css";

import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Navbar } from "@components/Navbar";
import { GlobalNav } from "@components/GlobalNav";
import { OrganizationHeader } from "@/components/OrganizationHeader";
import { auth } from "@clerk/nextjs/server";
import { SanbiStoreProvider } from "@/providers/sanbi-store-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: "Sanbi",
  description: "Set planner app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  const gridColumns = userId ? "min-[1025px]:grid-cols-[300px_1fr]" : "";

  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.variable}`}>
        <body>
          <TRPCReactProvider>
            <SanbiStoreProvider>
              <div className={`min-[1025px]:grid ${gridColumns} min-h-screen`}>
                <SignedIn>
                  <nav className="hidden rounded-b border border-t-0 border-slate-100 bg-slate-50 min-[1025px]:sticky min-[1025px]:top-0 min-[1025px]:block min-[1025px]:px-8 min-[1025px]:py-6">
                    <OrganizationHeader />
                    <GlobalNav />
                  </nav>
                </SignedIn>
                <div>
                  <Navbar />
                  {children}
                </div>
              </div>
            </SanbiStoreProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
