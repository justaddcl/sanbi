import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { NextResponse } from "next/server";
import { z } from "zod";

type GetOrganizationParams = {
  organizationId: string;
};

export async function GET(
  _request: Request,
  context: { params: GetOrganizationParams },
) {
  const validatedParams = z
    .object({ organizationId: z.uuid() })
    .safeParse(context.params);

  // Return early if the form data is invalid
  if (!validatedParams.success) {
    return NextResponse.json({
      errors: validatedParams.error.flatten().fieldErrors,
    });
  }

  try {
    const isMemberOfOrganization = await api.organization.organization(
      validatedParams.data,
    );
    return NextResponse.json({ isMemberOfOrganization });
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
