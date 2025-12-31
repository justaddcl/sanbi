import "server-only";
import "@lib/orpc/server-client";

export const serverApi = globalThis.$orpc!;
