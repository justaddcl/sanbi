export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/orpc/server-client");
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
