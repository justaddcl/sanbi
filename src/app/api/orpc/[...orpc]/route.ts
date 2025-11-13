import { OpenAPIHandler } from "@orpc/openapi/fetch"; // or '@orpc/server/node'
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";

import { createORPCContext } from "@server/orpc/base";
import { appRouter } from "@server/orpc/routers";

const handler = new OpenAPIHandler(appRouter, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export default async function fetch(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: "/api/orpc",
    context: await createORPCContext(request),
  });

  if (matched) {
    return response;
  }

  return new Response("Not Found", { status: 404 });
}

export const GET = fetch;
export const POST = fetch;
export const PUT = fetch;
export const PATCH = fetch;
export const DELETE = fetch;
