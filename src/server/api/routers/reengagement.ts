/**
 * Epic 11 Story 11.9: Re-engagement Automation
 * tRPC router for user re-engagement and retention automation
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"

/**
 * Calculate days since last activity
 */
function daysSinceLastActivity(lastActivity: Date | null): number {
  if (!lastActivity) return 999
  const now = new Date()
  const diffTime = now.getTime() - lastActivity.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determine user engagement level
 */
function getUserEngagementLevel(daysSince: number): "ACTIVE" | "AT_RISK" | "DORMANT" | "INACTIVE" {
  if (daysSince <= 3) return "ACTIVE"
  if (daysSince <= 7) return "AT_RISK"
  if (daysSince <= 30) return "DORMANT"
  return "INACTIVE"
}

export const reengagementRouter = createTRPCRouter({
  /**
   * Get user engagement status
   */
  getEngagementStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        lastLoginAt: true,
        currentStreak: true,
        level: true,
        points: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const daysSince = daysSinceLastActivity(user.lastLoginAt)
    const engagementLevel = getUserEngagementLevel(daysSince)

    // Get suggestions based on engagement level
    const suggestions = getSuggestionsForEngagement(engagementLevel, user)

    return {
      engagementLevel,
      daysSinceLastActivity: daysSince,
      currentStreak: user.currentStreak,
      suggestions,
    }
  }),

  /**
   * Get inactive users (admin/cron use)
   */
  getInactiveUsers: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).default(7),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - input.days)

      const users = await ctx.db.user.findMany({
        where: {
          lastLoginAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          lastLoginAt: true,
          currentStreak: true,
          level: true,
          points: true,
        },
        orderBy: {
          lastLoginAt: "asc",
        },
        take: input.limit,
      })

      return users.map((user) => ({
        ...user,
        daysSinceLastActivity: daysSinceLastActivity(user.lastLoginAt),
        engagementLevel: getUserEngagementLevel(daysSinceLastActivity(user.lastLoginAt)),
      }))
    }),

  /**
   * Send re-engagement notification
   */
  sendReengagementNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(["STREAK_REMINDER", "NEW_FEATURES", "PERSONALIZED_CONTENT", "WIN_BACK"]),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: _ctx, input }) => {
      // Record the notification attempt
      // In production, this would trigger actual email/push notification
      // For now, we'll just log it

      const notificationContent = getNotificationContent(input.type)

      return {
        success: true,
        type: input.type,
        content: notificationContent,
        sentAt: new Date(),
      }
    }),

  /**
   * Get personalized win-back offers
   */
  getWinBackOffers: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        lastLoginAt: true,
        currentStreak: true,
        level: true,
        points: true,
        lifetimePoints: true,
        expertiseLevel: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const daysSince = daysSinceLastActivity(user.lastLoginAt)
    const engagementLevel = getUserEngagementLevel(daysSince)

    const offers = []

    // Offer bonus points for coming back
    if (engagementLevel === "DORMANT" || engagementLevel === "INACTIVE") {
      offers.push({
        type: "BONUS_POINTS",
        title: "Bonus de retour",
        description: "Connectez-vous aujourd'hui et gagnez 100 points bonus",
        points: 100,
        expiresIn: 7,
      })
    }

    // Offer streak protection if they had a good streak
    if (user.currentStreak >= 7 && daysSince <= 2) {
      offers.push({
        type: "STREAK_PROTECTION",
        title: "Protection de série",
        description: "Votre série de " + user.currentStreak + " jours est en danger !",
        action: "Connectez-vous maintenant pour la maintenir",
      })
    }

    // Offer premium trial for high-level inactive users
    if (user.level >= 10 && engagementLevel === "INACTIVE") {
      offers.push({
        type: "PREMIUM_TRIAL",
        title: "Essai Premium gratuit",
        description: "7 jours de Premium gratuit pour votre retour",
        duration: 7,
      })
    }

    // Personalized content based on expertise
    offers.push({
      type: "PERSONALIZED_CONTENT",
      title: "Nouveau contenu pour vous",
      description: `${getDaysAwayMessage(daysSince)} Découvrez les nouvelles analyses et agents IA`,
      items: getPersonalizedContent(user.expertiseLevel),
    })

    return {
      offers,
      engagementLevel,
      daysSinceLastActivity: daysSince,
    }
  }),

  /**
   * Track re-engagement metrics
   */
  getReengagementMetrics: publicProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Count users by engagement level
    const totalUsers = await ctx.db.user.count()

    const activeUsers = await ctx.db.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const atRiskUsers = await ctx.db.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const dormantUsers = await ctx.db.user.count({
      where: {
        lastLoginAt: {
          gte: thirtyDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    })

    const inactiveUsers = await ctx.db.user.count({
      where: {
        lastLoginAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    return {
      total: totalUsers,
      active: activeUsers,
      atRisk: atRiskUsers,
      dormant: dormantUsers,
      inactive: inactiveUsers,
      percentages: {
        active: Math.round((activeUsers / totalUsers) * 100),
        atRisk: Math.round((atRiskUsers / totalUsers) * 100),
        dormant: Math.round((dormantUsers / totalUsers) * 100),
        inactive: Math.round((inactiveUsers / totalUsers) * 100),
      },
    }
  }),
})

/**
 * Get suggestions based on engagement level
 */
function getSuggestionsForEngagement(
  level: "ACTIVE" | "AT_RISK" | "DORMANT" | "INACTIVE",
  _user: { currentStreak: number; level: number; points: number }
): string[] {
  switch (level) {
    case "ACTIVE":
      return [
        "Maintenez votre série quotidienne !",
        "Explorez de nouvelles analyses",
        "Participez à un concours de pronostics",
      ]
    case "AT_RISK":
      return [
        "Votre série risque de se terminer, connectez-vous !",
        "Découvrez les nouveaux agents IA disponibles",
        "Réclamez votre récompense quotidienne",
      ]
    case "DORMANT":
      return [
        "Ça fait un moment ! Voici ce que vous avez manqué...",
        "Bonus de retour : 100 points vous attendent",
        "Nouveaux concours et défis disponibles",
      ]
    case "INACTIVE":
      return [
        "Bon retour parmi nous !",
        "Essayez notre nouveau mode Expert",
        "Rejoignez la communauté dans les salles collaboratives",
      ]
  }
}

/**
 * Get notification content by type
 */
function getNotificationContent(type: string): { title: string; body: string } {
  switch (type) {
    case "STREAK_REMINDER":
      return {
        title: "Votre série est en danger !",
        body: "Ne perdez pas votre série ! Connectez-vous maintenant.",
      }
    case "NEW_FEATURES":
      return {
        title: "Nouvelles fonctionnalités disponibles",
        body: "Découvrez les dernières mises à jour de la plateforme.",
      }
    case "PERSONALIZED_CONTENT":
      return {
        title: "Nouveau contenu pour vous",
        body: "Des analyses personnalisées vous attendent.",
      }
    case "WIN_BACK":
      return {
        title: "Nous vous avons manqué !",
        body: "Revenez et profitez de bonus exclusifs.",
      }
    default:
      return {
        title: "Notification",
        body: "Vous avez une nouvelle notification.",
      }
  }
}

/**
 * Get message based on days away
 */
function getDaysAwayMessage(days: number): string {
  if (days === 0) return "Bienvenue !"
  if (days === 1) return "Vous étiez absent hier."
  if (days <= 7) return `Vous étiez absent ${days} jours.`
  if (days <= 30) return `Ça fait ${days} jours !`
  return "Bon retour !"
}

/**
 * Get personalized content recommendations
 */
function getPersonalizedContent(expertiseLevel: string): string[] {
  switch (expertiseLevel) {
    case "BEGINNER":
      return ["Tutoriel agents IA", "Guide des pronostics", "Analyses simples"]
    case "INTERMEDIATE":
      return ["Analyses avancées", "Stratégies gagnantes", "Concours hebdomadaires"]
    case "EXPERT":
      return ["Statistiques détaillées", "Modèles prédictifs", "Débats d'experts"]
    default:
      return ["Découvrir la plateforme"]
  }
}
