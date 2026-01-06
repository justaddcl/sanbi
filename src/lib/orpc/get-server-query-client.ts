import { cache } from "react";

import { makeQueryClient } from "@lib/tanstack/query-client";

import "server-only";

export const getServerQueryClient = cache(makeQueryClient);
