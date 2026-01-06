import "server-only";

import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { orpcServer } from "./server";

export const orpcServerTQ = createTanstackQueryUtils(orpcServer, {
  path: ["orpc"],
});
