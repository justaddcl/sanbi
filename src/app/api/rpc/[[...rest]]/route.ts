import { getLogger, LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

import { logger } from "@lib/loggers/logger";
import { createORPCContext, REST_PREFIX, RPC_PREFIX } from "@server/orpc/base";
import { appRouter } from "@server/orpc/routers";
import { getBaseUrl } from "@server/utils/urls/getBaseUrl";

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
        servers: [
          {
            url: getBaseUrl() + REST_PREFIX,
          },
        ],
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handler(request: Request) {
  const url = new URL(request.url);
  const context = await createORPCContext({ headers: request.headers });

  // If it's a REST/OpenAPI request, don't even try the RPC handler
  if (url.pathname.startsWith(REST_PREFIX)) {
    const apiResult = await apiHandler.handle(request, {
      prefix: REST_PREFIX,
      context,
    });

    return apiResult.response ?? new Response("Not Found", { status: 404 });
  }

  // Otherwise, treat it as a normal RPC request
  const rpcResult = await rpcHandler.handle(request, {
    prefix: RPC_PREFIX,
    context,
  });

  return rpcResult.response ?? new Response("Not Found", { status: 404 });
}

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
