import { trpc } from "@lib/trpc/server";

export async function GET(_request: Request) {
  const users = await trpc.user.getAll();
  return Response.json({ users });
}
