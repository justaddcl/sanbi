"use server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

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
