import pino, { type Logger as PinoLogger } from "pino";

const isDev = process.env.NODE_ENV !== "production";

type LogMethod = (messageOrObject?: unknown, ...args: unknown[]) => void;
type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
type LogMethods = Record<LogLevel, LogMethod>;

export type LoggerBindings = Record<string, unknown>;

export type AppLogger = LogMethods & {
  child: (bindings: LoggerBindings) => AppLogger;
};

const baseLogger = pino({
  level: isDev ? "trace" : "info",

  redact: {
    paths: [
      "authorization",
      "cookie",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "auth",
      "auth.*",
      "password",
      "*.password",
      "input.password",
      "input.*.password",
      "user.token",
      "*.token",
      "session",
      "session.*",
      "user.password",
    ],
    remove: true,
  },

  base: {
    app: "sanbi",
  },
});

const asError = (value: unknown) => {
  if (value instanceof Error) {
    return { err: value };
  }

  return value;
};

const logWith =
  (pinoLogger: PinoLogger, level: LogLevel): LogMethod =>
  (messageOrObject?: unknown, ...args: unknown[]) => {
    const log = pinoLogger[level].bind(pinoLogger);

    if (typeof messageOrObject === "string") {
      if (args.length === 0) {
        log(messageOrObject);
        return;
      }

      const [firstArg, ...remainingArgs] = args;

      if (
        firstArg &&
        typeof firstArg === "object" &&
        remainingArgs.length === 0
      ) {
        log(asError(firstArg), messageOrObject);
        return;
      }

      log({ args: args.map(asError) }, messageOrObject);
      return;
    }

    if (messageOrObject === undefined) {
      log("");
      return;
    }

    if (args.length === 0) {
      log(asError(messageOrObject));
      return;
    }

    const [message, ...remainingArgs] = args;

    if (typeof message === "string") {
      log(asError(messageOrObject), message, ...remainingArgs);
      return;
    }

    log(
      {
        value: asError(messageOrObject),
        args: args.map(asError),
      },
      "structured log arguments",
    );
  };

const wrapLogger = (pinoLogger: PinoLogger): AppLogger => ({
  trace: logWith(pinoLogger, "trace"),
  debug: logWith(pinoLogger, "debug"),
  info: logWith(pinoLogger, "info"),
  warn: logWith(pinoLogger, "warn"),
  error: logWith(pinoLogger, "error"),
  fatal: logWith(pinoLogger, "fatal"),
  child: (bindings) => wrapLogger(pinoLogger.child(bindings)),
});

export const logger = wrapLogger(baseLogger);

export const getRouteLogger = (
  parentLogger: AppLogger | undefined,
  route: string,
  extra: LoggerBindings = {},
) => {
  return (parentLogger ?? logger).child({
    route,
    ...extra,
  });
};

export const getElapsedDurationMs = (startedAt: number) =>
  Math.round(performance.now() - startedAt);

export const getProcedureLogger = ({
  parentLogger,
  path,
  type,
}: {
  parentLogger?: AppLogger;
  path: string;
  type: string;
}) => {
  const [router, ...procedureParts] = path.split(".");
  const procedure = procedureParts.join(".");
  const route = procedure ? `/${router}/${procedure}` : `/${router}`;

  return (parentLogger ?? logger).child({
    router,
    procedure,
    route,
    procedureType: type,
  });
};
