"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@components/ui/button";
import { MagnifyingGlass, Sidebar } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import Link from "next/link";
import { GlobalNav } from "@components/GlobalNav";
import { OrganizationHeader } from "@components/OrganizationHeader";
import { useSanbiStore } from "@/providers/sanbi-store-provider";

export const Navbar: React.FC = () => {
  const { isMobileNavOpen, setIsMobileNavOpen } = useSanbiStore(
    (state) => state,
  );

  return (
    <>
      <SignedIn>
        <header className="sticky top-0 z-50 grid h-14 grid-cols-[40px_1fr_40px] content-center items-center gap-x-4 rounded-t border border-l-0 border-solid border-slate-100 bg-slate-50 px-4 min-[1025px]:h-16 min-[1025px]:grid-cols-[1fr_28px] min-[1025px]:bg-white min-[1025px]:px-9">
          <div className="min-[1025px]:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded border-slate-200"
                >
                  <Sidebar size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <OrganizationHeader />
                <GlobalNav />
              </SheetContent>
            </Sheet>
          </div>
          {/* TODO: The search input will be implemented in SWY-36 and SWY-37*/}
          <div className="relative flex w-full items-center justify-self-center rounded-lg border border-slate-200 bg-white px-3 min-[1025px]:max-w-3xl">
            <MagnifyingGlass size={16} className="" />
            <Input placeholder="Search" className="border-none" />
          </div>
          <div className="grid place-content-center min-[1025px]:block min-[1025px]:place-self-end">
            <UserButton />
          </div>
        </header>
      </SignedIn>
      <SignedOut>
        <header className="sticky top-0 flex h-14 justify-between gap-x-4 rounded-t border border-solid border-slate-100 bg-slate-50 px-4 py-2 min-[1025px]:h-16">
          <Link href="/" className="self-center">
            Sanbi
          </Link>
          <Button>
            <SignInButton />
          </Button>
        </header>
      </SignedOut>
    </>
  );
};
