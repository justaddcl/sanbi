import "@/styles/globals.css";

import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";

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
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.variable}`}>
        <body>
          <Navbar />
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
