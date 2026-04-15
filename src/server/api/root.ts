import { accountRouter } from "~/server/api/routers/account";
import { agentsRouter } from "~/server/api/routers/agents";
import { authRouter } from "~/server/api/routers/auth";
import { matchRouter } from "~/server/api/routers/match";
import { notificationsRouter } from "~/server/api/routers/notifications";
import { onboardingRouter } from "~/server/api/routers/onboarding";
import { postRouter } from "~/server/api/routers/post";
import { profileRouter } from "~/server/api/routers/profile";
import { sessionRouter } from "~/server/api/routers/session";
import { termsRouter } from "~/server/api/routers/terms";
import { tourRouter } from "~/server/api/routers/tour";
import { tutorialRouter } from "~/server/api/routers/tutorial";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  account: accountRouter,
  agents: agentsRouter,
  auth: authRouter,
  match: matchRouter,
  notifications: notificationsRouter,
  onboarding: onboardingRouter,
  post: postRouter,
  profile: profileRouter,
  session: sessionRouter,
  terms: termsRouter,
  tour: tourRouter,
  tutorial: tutorialRouter,
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
