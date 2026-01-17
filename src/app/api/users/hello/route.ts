import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";

import { trpc } from "@lib/trpc/server";

export async function GET() {
  try {
    const greeting = await trpc.user.hello();
    return NextResponse.json({ greeting });
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return NextResponse.json({ error }, { status: 401 });
    } else {
      throw error;
    }
  }
}
