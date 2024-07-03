import { api } from "@/trpc/server";

export async function GET(request: Request) {
  const users = await api.user.getAll();
  return Response.json({ users });
}
