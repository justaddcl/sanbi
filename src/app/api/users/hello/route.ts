import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const greeting = await api.user.hello();
    return NextResponse.json({ greeting });
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return NextResponse.json({ error }, { status: 401 });
    } else {
      throw error;
    }
  }
}
