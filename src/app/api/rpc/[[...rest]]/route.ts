import { getLogger, LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

import { logger } from "@lib/loggers/logger";
import { createORPCContext } from "@server/orpc/base";
import { appRouter } from "@server/orpc/routers";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
    async ({ context, next }) => {
      const start = process.hrtime.bigint();
      const result = await next(); // correctly typed as StandardHandleResult
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;

      const reqLogger = getLogger(context);
      reqLogger?.info({ durationMs }, "request handled");

      return result;
    },
  ],
  plugins: [
    new LoggingHandlerPlugin({
      logger,
      generateId: ({ request }) => crypto.randomUUID(),
      logRequestResponse: true,
      logRequestAbort: true,
    }),
  ],
});

const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new CORSPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Sanbi API",
          version: "1.0.0",
          description: "Sanbi API",
        },
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export async function handleRequest(request: Request) {
  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: await createORPCContext(request),
  });

  if (rpcResult.matched) {
    return rpcResult.response;
  }

  const apiResult = await apiHandler.handle(request, {
    prefix: "/api/rpc/api-reference",
    context: await createORPCContext(request),
  });

  if (apiResult.response) {
    return apiResult.response;
  }

  return new Response("Not Found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
