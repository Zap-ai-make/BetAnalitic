import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tourRouter = createTRPCRouter({
  /**
   * Get tour status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        tourCompleted: true,
        tourSkipped: true,
        tutorialCompleted: true,
        tutorialSkipped: true,
      },
    });

    if (!user) {
      return {
        needsTour: false,
        completed: false,
        skipped: false,
      };
    }

    // Tour should start after tutorial is done
    const needsTour =
      (user.tutorialCompleted || user.tutorialSkipped) &&
      !user.tourCompleted &&
      !user.tourSkipped;

    return {
      needsTour,
      completed: user.tourCompleted,
      skipped: user.tourSkipped,
    };
  }),

  /**
   * Complete tour
   */
  complete: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { tourCompleted: true },
    });
    return { success: true };
  }),

  /**
   * Skip tour
   */
  skip: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { tourSkipped: true },
    });
    return { success: true };
  }),

  /**
   * Restart tour (from Help menu)
   */
  restart: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        tourCompleted: false,
        tourSkipped: false,
      },
    });
    return { success: true };
  }),
});
