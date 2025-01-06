import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import {
  eventTypeRouter,
  organizationMembershipsRouter,
  organizationRouter,
  setRouter,
  setSectionTypeRouter,
  songRouter,
  userRouter,
  setSectionSongRouter,
} from "@server/api/routers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  organization: organizationRouter,
  organizationMemberships: organizationMembershipsRouter,
  set: setRouter,
  song: songRouter,
  eventType: eventTypeRouter,
  setSectionType: setSectionTypeRouter,
  setSectionSong: setSectionSongRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
