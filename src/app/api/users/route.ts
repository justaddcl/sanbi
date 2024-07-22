import { api } from "@/trpc/server";

export async function GET(_request: Request) {
  const users = await api.user.getAll();
  return Response.json({ users });
}
