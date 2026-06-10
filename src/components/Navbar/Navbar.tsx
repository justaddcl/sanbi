"use client";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Sidebar } from "@phosphor-icons/react/dist/ssr";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { Button } from "@components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
import { GlobalNav } from "@components/GlobalNav";
import { OrganizationHeader } from "@components/OrganizationHeader";
import { Search } from "@modules/search";
import { useSanbiStore } from "@/providers/sanbi-store-provider";

export const Navbar: React.FC = () => {
  const { isMobileNavOpen, setIsMobileNavOpen } = useSanbiStore(
    (state) => state,
  );

  return (
    <>
      <Show when="signed-in">
        <header className="sticky top-0 z-50 grid h-14 grid-cols-[40px_1fr_40px] content-center items-center gap-x-4 rounded-t border border-l-0 border-solid border-slate-100 bg-slate-50 px-4 min-[1025px]:h-16 min-[1025px]:grid-cols-[1fr_28px] min-[1025px]:bg-white min-[1025px]:px-9">
          <div className="min-[1025px]:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded border-slate-200"
                  aria-label="Open mobile navigation"
                >
                  <Sidebar size={16} />
                </Button>
              </SheetTrigger>
              <VisuallyHidden.Root>
                <SheetTitle>Mobile side nav</SheetTitle>
                <SheetDescription>
                  Sanbi mobile side navigation
                </SheetDescription>
              </VisuallyHidden.Root>
              <SheetContent side="left">
                <OrganizationHeader />
                <GlobalNav />
              </SheetContent>
            </Sheet>
          </div>
          <Search className="justify-self-center" />
          <div className="grid place-content-center min-[1025px]:block min-[1025px]:place-self-end">
            <UserButton />
          </div>
        </header>
      </Show>
      <Show when="signed-out">
        <header className="sticky top-0 flex h-14 justify-between gap-x-4 rounded-t border border-solid border-slate-100 bg-slate-50 px-4 py-2 min-[1025px]:h-16">
          <Link href="/" className="self-center">
            Sanbi
          </Link>
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
        </header>
      </Show>
    </>
  );
};
