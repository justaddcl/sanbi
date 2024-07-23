import { type NewOrganization } from "@/lib/types";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const createOrganizationInput: NewOrganization =
    (await request.json()) as NewOrganization;
  try {
    const newOrganization = await api.organization.create(
      createOrganizationInput,
    );
    return NextResponse.json({ newOrganization });
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      const status = getHTTPStatusCodeFromError(error);
      return NextResponse.json(
        {
          error: {
            cause: error.cause,
            code: error.code,
            message: error.message,
            name: error.name,
            status,
          },
        },
        { status },
      );
    }
    return NextResponse.json({ error });
  }
}
