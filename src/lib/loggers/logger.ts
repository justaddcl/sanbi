import { getLogger } from "@orpc/experimental-pino";
import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: isDev ? "trace" : "info",

  // scrub sensitive stuff – tweak as needed
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "auth",
      "auth.*",
      "user.password",
      "*.password",
    ],
    remove: true,
  },

  // optional: add a base app name
  base: {
    app: "sanbi",
  },
});

export const getRouteLogger = (
  context: unknown,
  route: string,
  extra: Record<string, unknown> = {},
) => {
  if (!context) return undefined;

  const logger = getLogger(context);
  if (!logger) return undefined;

  return logger.child({
    route,
    ...extra,
  });
};
