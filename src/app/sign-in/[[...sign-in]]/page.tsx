"use server";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = auth();

  if (!userId) {
    return (
      <main className="m-auto mt-16 max-w-md">
        <SignIn />
      </main>
    );
  } else {
    redirect("/");
  }
}
