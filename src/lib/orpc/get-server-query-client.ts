import "server-only";

import { cache } from "react";

import { makeQueryClient } from "@lib/tanstack/query-client";

export const getServerQueryClient = cache(makeQueryClient);
