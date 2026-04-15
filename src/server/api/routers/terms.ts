import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const termsRouter = createTRPCRouter({
  /**
   * Check if user has accepted terms and risk disclaimer
   */
  getTermsStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        termsAcceptedAt: true,
        riskDisclaimerAccepted: true,
        ageVerified: true,
      },
    });

    if (!user) {
      return {
        hasAcceptedTerms: false,
        hasAcceptedRiskDisclaimer: false,
        hasVerifiedAge: false,
        canUseAgents: false,
      };
    }

    const canUseAgents =
      !!user.termsAcceptedAt &&
      user.riskDisclaimerAccepted &&
      user.ageVerified;

    return {
      hasAcceptedTerms: !!user.termsAcceptedAt,
      hasAcceptedRiskDisclaimer: user.riskDisclaimerAccepted,
      hasVerifiedAge: user.ageVerified,
      canUseAgents,
      termsAcceptedAt: user.termsAcceptedAt,
    };
  }),

  /**
   * Accept terms and risk disclaimer
   */
  acceptTerms: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        termsAcceptedAt: new Date(),
        riskDisclaimerAccepted: true,
        ageVerified: true,
      },
    });

    return { success: true };
  }),
});
