import pretty from "pino-pretty";

const stream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
});

let isShuttingDown = false;

const cleanup = () => {
  process.stdin.unpipe(stream);
  stream.unpipe(process.stdout);
};

const shutdown = (code: number, error?: NodeJS.ErrnoException) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  cleanup();

  if (error && error.code !== "EPIPE") {
    console.error(error);
  }

  process.exit(code);
};

const handleError = (error: NodeJS.ErrnoException) => {
  shutdown(error.code === "EPIPE" ? 0 : 1, error);
};

stream.on("error", handleError);
stream.on("close", () => shutdown(0));
process.stdin.on("error", handleError);
process.stdin.on("close", () => shutdown(0));
process.stdout.on("error", handleError);
process.stdout.on("close", () => shutdown(0));

process.stdin.pipe(stream).pipe(process.stdout);
