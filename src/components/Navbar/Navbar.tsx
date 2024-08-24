import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { MagnifyingGlass, Sidebar } from "@phosphor-icons/react/dist/ssr";
import { Input } from "../ui/input";

export const Navbar: React.FC = () => {
  return (
    <header className="grid h-14 grid-cols-[40px_1fr] items-center gap-x-4 border-b px-4 py-2">
      <Button variant="outline" size="icon" className="rounded">
        <Sidebar size={16} />
      </Button>
      <div className="grid grid-cols-[1fr_40px] gap-x-4">
        <SignedIn>
          {/* TODO: The search input will be implemented in SWY-36 and SWY-37*/}
          <div className="relative flex items-center rounded border border-slate-200 px-3">
            <MagnifyingGlass size={16} className="" />
            <Input placeholder="Search" className="border-none" />
          </div>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};
