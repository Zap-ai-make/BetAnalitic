import { accountRouter } from "~/server/api/routers/account";
import { achievementsRouter } from "~/server/api/routers/achievements";
import { adminRouter } from "~/server/api/routers/admin";
import { agentsRouter } from "~/server/api/routers/agents";
import { authRouter } from "~/server/api/routers/auth";
import { contestsRouter } from "~/server/api/routers/contests";
import { expertRouter } from "~/server/api/routers/expert";
import { gamificationRouter } from "~/server/api/routers/gamification";
import { matchRouter } from "~/server/api/routers/match";
import { notificationsRouter } from "~/server/api/routers/notifications";
import { onboardingRouter } from "~/server/api/routers/onboarding";
import { preferencesRouter } from "~/server/api/routers/preferences";
import { profileRouter } from "~/server/api/routers/profile";
import { reengagementRouter } from "~/server/api/routers/reengagement";
import { referralRouter } from "~/server/api/routers/referral";
import { roomRouter } from "~/server/api/routers/room";
import { searchRouter } from "~/server/api/routers/search";
import { sessionRouter } from "~/server/api/routers/session";
import { streakRouter } from "~/server/api/routers/streak";
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
  achievements: achievementsRouter,
  admin: adminRouter,
  agents: agentsRouter,
  auth: authRouter,
  contests: contestsRouter,
  expert: expertRouter,
  gamification: gamificationRouter,
  match: matchRouter,
  notifications: notificationsRouter,
  onboarding: onboardingRouter,
  preferences: preferencesRouter,
  profile: profileRouter,
  reengagement: reengagementRouter,
  referral: referralRouter,
  room: roomRouter,
  search: searchRouter,
  session: sessionRouter,
  streak: streakRouter,
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
