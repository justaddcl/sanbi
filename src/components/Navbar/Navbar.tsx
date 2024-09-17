import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@components/ui/button";
import { MagnifyingGlass, Sidebar } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import Link from "next/link";
import { GlobalNav } from "@components/GlobalNav";
import { OrganizationHeader } from "@components/OrganizationHeader";

export const Navbar: React.FC = () => {
  return (
    <>
      <SignedIn>
        <header className="grid h-14 grid-cols-[40px_1fr_40px] content-center items-center gap-x-4 rounded-t border border-l-0 border-solid border-slate-100 bg-slate-50 px-4 lg:h-16 lg:grid-cols-[1fr_28px] lg:bg-inherit lg:px-9">
          <div className="lg:hidden">
            <Sheet>
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
          <div className="relative flex w-full items-center justify-self-center rounded-lg border border-slate-200 bg-white px-3 lg:max-w-3xl">
            <MagnifyingGlass size={16} className="" />
            <Input placeholder="Search" className="border-none" />
          </div>
          <div className="grid place-content-center lg:block lg:place-self-end">
            <UserButton />
          </div>
        </header>
      </SignedIn>
      <SignedOut>
        <header className="flex h-14 justify-between gap-x-4 rounded-t border border-solid border-slate-100 bg-slate-50 px-4 py-2 lg:h-16">
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
