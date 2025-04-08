import { type AppRouter } from "@server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

export type UserData = inferProcedureOutput<AppRouter["user"]["getUser"]>;
