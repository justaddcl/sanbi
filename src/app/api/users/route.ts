import { api } from "@/trpc/server";

export async function GET(request: Request) {
  console.log("🚀 ~ GET ~ request:", request);
  const users = await api.user.getAll();
  return Response.json({ users });
}
