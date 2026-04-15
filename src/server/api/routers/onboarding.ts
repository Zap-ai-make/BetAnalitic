import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const onboardingRouter = createTRPCRouter({
  /**
   * Get onboarding status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        onboardingCompleted: true,
        onboardingSkipped: true,
        userMode: true,
        favoriteTeams: true,
        favoriteSports: true,
        expertiseLevel: true,
      },
    });

    if (!user) {
      return {
        needsOnboarding: true,
        completed: false,
        skipped: false,
      };
    }

    return {
      needsOnboarding: !user.onboardingCompleted && !user.onboardingSkipped,
      completed: user.onboardingCompleted,
      skipped: user.onboardingSkipped,
      userMode: user.userMode,
      favoriteTeams: user.favoriteTeams,
      favoriteSports: user.favoriteSports,
      expertiseLevel: user.expertiseLevel,
    };
  }),

  /**
   * Save Step 1: Mode choice
   */
  saveMode: protectedProcedure
    .input(z.object({ mode: z.enum(["ANALYTIC", "SUPPORTER"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { userMode: input.mode },
      });
      return { success: true };
    }),

  /**
   * Save Step 2: Favorite teams
   */
  saveTeams: protectedProcedure
    .input(
      z.object({
        teams: z.array(z.string()).max(5),
        sports: z.array(z.string()).max(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          favoriteTeams: input.teams,
          favoriteSports: input.sports,
        },
      });
      return { success: true };
    }),

  /**
   * Save Step 3: Alert preferences (placeholder for now)
   */
  saveAlerts: protectedProcedure
    .input(
      z.object({
        matchAlerts: z.boolean(),
        agentAlerts: z.boolean(),
        weeklyDigest: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Create notification preferences table
      // For now, just return success
      console.log("Alert preferences:", input, "for user:", ctx.session.user.id);
      return { success: true };
    }),

  /**
   * Complete onboarding
   */
  complete: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { onboardingCompleted: true },
    });
    return { success: true };
  }),

  /**
   * Skip onboarding
   */
  skip: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { onboardingSkipped: true },
    });
    return { success: true };
  }),

  /**
   * Restart onboarding (from settings)
   */
  restart: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        onboardingCompleted: false,
        onboardingSkipped: false,
      },
    });
    return { success: true };
  }),
});
