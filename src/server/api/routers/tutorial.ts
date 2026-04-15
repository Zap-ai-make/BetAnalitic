import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tutorialRouter = createTRPCRouter({
  /**
   * Get tutorial status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        tutorialCompleted: true,
        tutorialSkipped: true,
        firstAnalysisAt: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return {
        needsTutorial: false,
        completed: false,
        skipped: false,
      };
    }

    // Tutorial should start after onboarding is done
    const needsTutorial =
      user.onboardingCompleted &&
      !user.tutorialCompleted &&
      !user.tutorialSkipped;

    return {
      needsTutorial,
      completed: user.tutorialCompleted,
      skipped: user.tutorialSkipped,
      firstAnalysisAt: user.firstAnalysisAt,
    };
  }),

  /**
   * Complete tutorial
   */
  complete: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        tutorialCompleted: true,
        firstAnalysisAt: new Date(),
      },
    });
    return { success: true };
  }),

  /**
   * Skip tutorial
   */
  skip: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { tutorialSkipped: true },
    });
    return { success: true };
  }),

  /**
   * Restart tutorial (from Help menu)
   */
  restart: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        tutorialCompleted: false,
        tutorialSkipped: false,
      },
    });
    return { success: true };
  }),
});
