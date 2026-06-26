import { type NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { getElapsedDurationMs, logger } from "@lib/loggers/logger";
import { appRouter } from "@/server/api/root";
import { createRequestId, createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (
  req: NextRequest,
  requestId: string,
  requestLogger: typeof logger,
) => {
  return createTRPCContext({
    headers: req.headers,
    logger: requestLogger,
    requestId,
  });
};

const handler = async (req: NextRequest) => {
  const requestId = req.headers.get("x-request-id") ?? createRequestId();
  const requestLogger = logger.child({
    requestId,
    route: "/api/trpc",
    method: req.method,
  });
  const startedAt = performance.now();
  const onAbort = () => {
    requestLogger.warn(
      { durationMs: getElapsedDurationMs(startedAt) },
      "tRPC request aborted",
    );
  };

  req.signal.addEventListener("abort", onAbort, { once: true });
  requestLogger.info("tRPC request started");

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => createContext(req, requestId, requestLogger),
      onError: ({ path, error }) => {
        requestLogger.error(
          {
            error,
            path,
          },
          `tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
        );
      },
    });

    requestLogger.info(
      {
        durationMs: getElapsedDurationMs(startedAt),
        status: response.status,
      },
      "tRPC request completed",
    );

    return response;
  } catch (error) {
    requestLogger.error(
      {
        durationMs: getElapsedDurationMs(startedAt),
        error,
      },
      "tRPC request failed",
    );

    throw error;
  } finally {
    req.signal.removeEventListener("abort", onAbort);
  }
};

export { handler as GET, handler as POST };
