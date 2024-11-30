"use server";

import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export async function deleteSet(setId: string, organizationId: string) {
  try {
    await api.set.delete({ setId, organizationId });
    toast.success("Set deleted");
    redirect(`/${organizationId}`);
  } catch (deleteSetError) {
    if (deleteSetError instanceof TRPCError) {
      switch (deleteSetError.code) {
        case "FORBIDDEN":
        default:
          console.error(
            `🤖 - [mutations/deleteSet/${setId}]: ${deleteSetError.message}`,
          );
          toast.error("Set could not be deleted");
      }
    }
  }
}
