import { Poppins } from "next/font/google";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import { Toaster } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { GlobalNav } from "@components/GlobalNav";
import { Navbar } from "@components/Navbar";
import { OrganizationHeader } from "@/components/OrganizationHeader";
import { SanbiStoreProvider } from "@/providers/sanbi-store-provider";
import { TRPCReactProvider } from "@/trpc/react";

import "@/styles/globals.css";

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
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </head>
        <body>
          <TRPCReactProvider>
            <SanbiStoreProvider>
              <TooltipProvider>
                <Toaster position="bottom-center" richColors />
                <div
                  className={`min-[1025px]:grid ${gridColumns} min-h-screen`}
                >
                  <SignedIn>
                    <div className="hidden rounded-b border border-t-0 border-slate-100 bg-slate-50 min-[1025px]:sticky min-[1025px]:top-0 min-[1025px]:block min-[1025px]:px-8 min-[1025px]:py-6">
                      <OrganizationHeader />
                      <GlobalNav />
                    </div>
                  </SignedIn>
                  <div className="flex min-h-screen flex-col">
                    <Navbar />
                    {children}
                  </div>
                </div>
              </TooltipProvider>
            </SanbiStoreProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
