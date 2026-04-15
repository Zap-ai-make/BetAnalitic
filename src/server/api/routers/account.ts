import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { compare } from "bcryptjs";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Export cooldown: 24 hours
const EXPORT_COOLDOWN = 24 * 60 * 60 * 1000;
// Deletion grace period: 30 days
const DELETION_GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000;

export const accountRouter = createTRPCRouter({
  /**
   * Get account status (deletion scheduled, export available)
   */
  getAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        deletionScheduledAt: true,
        lastExportAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const canExport =
      !user.lastExportAt ||
      Date.now() - user.lastExportAt.getTime() > EXPORT_COOLDOWN;

    const exportCooldownEndsAt = user.lastExportAt
      ? new Date(user.lastExportAt.getTime() + EXPORT_COOLDOWN)
      : null;

    return {
      deletionScheduledAt: user.deletionScheduledAt,
      deletionWillCompleteAt: user.deletionScheduledAt
        ? new Date(user.deletionScheduledAt.getTime() + DELETION_GRACE_PERIOD)
        : null,
      canExport,
      exportCooldownEndsAt,
      lastExportAt: user.lastExportAt,
      accountCreatedAt: user.createdAt,
    };
  }),

  /**
   * Re-authenticate user (required for sensitive operations)
   */
  verifyPassword: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const valid = await compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mot de passe incorrect",
        });
      }

      return { success: true };
    }),

  /**
   * Request data export
   */
  requestExport: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        ageVerified: true,
        termsAcceptedAt: true,
        subscriptionTier: true,
        expertiseLevel: true,
        favoriteSports: true,
        favoriteTeams: true,
        analysisDepth: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        lastExportAt: true,
        onboardingCompleted: true,
        userMode: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Check cooldown
    if (user.lastExportAt) {
      const timeSinceLastExport = Date.now() - user.lastExportAt.getTime();
      if (timeSinceLastExport < EXPORT_COOLDOWN) {
        const hoursRemaining = Math.ceil(
          (EXPORT_COOLDOWN - timeSinceLastExport) / 3600000
        );
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Export disponible dans ${hoursRemaining}h`,
        });
      }
    }

    // Generate export data
    const exportData = {
      user: {
        email: user.email,
        phone: user.phone,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      verification: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        ageVerified: user.ageVerified,
        termsAcceptedAt: user.termsAcceptedAt,
      },
      subscription: {
        tier: user.subscriptionTier,
      },
      preferences: {
        expertiseLevel: user.expertiseLevel,
        favoriteSports: user.favoriteSports,
        favoriteTeams: user.favoriteTeams,
        analysisDepth: user.analysisDepth,
        language: user.language,
        userMode: user.userMode,
      },
      onboarding: {
        completed: user.onboardingCompleted,
      },
      // TODO: Add more data as features are implemented
      // agentHistory: [],
      // analyses: [],
      // rooms: [],
      // payments: [],
      exportedAt: new Date().toISOString(),
    };

    // Update last export timestamp
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { lastExportAt: new Date() },
    });

    // TODO: In production, send email with download link instead
    // For now, return data directly
    return {
      success: true,
      data: exportData,
    };
  }),

  /**
   * Schedule account deletion
   */
  scheduleAccountDeletion: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { deletionScheduledAt: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.deletionScheduledAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La suppression est déjà programmée",
        });
      }

      const deletionDate = new Date();

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          deletionScheduledAt: deletionDate,
          deletionReason: input.reason,
        },
      });

      const willCompleteAt = new Date(
        deletionDate.getTime() + DELETION_GRACE_PERIOD
      );

      // TODO: Send confirmation email

      return {
        success: true,
        scheduledAt: deletionDate,
        willCompleteAt,
      };
    }),

  /**
   * Cancel scheduled account deletion
   */
  cancelAccountDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { deletionScheduledAt: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!user.deletionScheduledAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Aucune suppression programmée",
      });
    }

    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        deletionScheduledAt: null,
        deletionReason: null,
      },
    });

    return { success: true };
  }),
});
