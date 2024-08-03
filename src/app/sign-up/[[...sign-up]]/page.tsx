import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="m-auto mt-16 max-w-md">
      <SignUp />
    </main>
  );
}
