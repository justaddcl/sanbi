import { type NewOrganizationMembership } from "@/lib/types";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const createOrganizationMembershipInput: NewOrganizationMembership =
    (await request.json()) as NewOrganizationMembership;
  try {
    const newOrganizationMembership = await api.organizationMemberships.create(
      createOrganizationMembershipInput,
    );
    return NextResponse.json({ newOrganizationMembership });
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
