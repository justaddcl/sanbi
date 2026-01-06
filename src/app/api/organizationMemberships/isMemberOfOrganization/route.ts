import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { z } from "zod";

import { trpc } from "@lib/trpc/server";

/**
 * @deprecated
 * This isn't used as the RPC routes are preferred and should be removed
 */
export async function POST(request: Request) {
  const input = (await request.json()) as { organizationId: string };
  console.log("🚀 ~ POST ~ input:", input);

  const validatedInput = z
    .object({ organizationId: z.uuid() })
    .safeParse(input);

  // Return early if the form data is invalid
  if (!validatedInput.success) {
    return NextResponse.json({
      errors: validatedInput.error.flatten().fieldErrors,
    });
  }

  try {
    const isMemberOfOrganization =
      await trpc.organizationMemberships.isMemberOfOrganization(input);
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
