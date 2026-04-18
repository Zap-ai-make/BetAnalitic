/**
 * Epic 11 Story 11.8: User Preferences & Personalization
 * tRPC router for user preferences and personalization settings
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"

export const preferencesRouter = createTRPCRouter({
  /**
   * Get all user preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        expertiseLevel: true,
        favoriteSports: true,
        favoriteTeams: true,
        analysisDepth: true,
        language: true,
      },
    })

    const notificationPrefs = await ctx.db.notificationPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    return {
      user,
      notifications: notificationPrefs ?? {
        pushEnabled: true,
        emailDigest: "NONE",
        inAppAlerts: true,
        dndEnabled: false,
        dndStart: "22:00",
        dndEnd: "08:00",
        matchAlerts: true,
        agentAlerts: true,
        weeklyDigest: false,
        roomAlerts: true,
      },
    }
  }),

  /**
   * Update content preferences
   */
  updateContentPreferences: protectedProcedure
    .input(
      z.object({
        expertiseLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]).optional(),
        favoriteSports: z.array(z.string()).optional(),
        favoriteTeams: z.array(z.string()).optional(),
        analysisDepth: z.enum(["QUICK", "STANDARD", "DETAILED"]).optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {}

      if (input.expertiseLevel) data.expertiseLevel = input.expertiseLevel
      if (input.favoriteSports) data.favoriteSports = input.favoriteSports
      if (input.favoriteTeams) data.favoriteTeams = input.favoriteTeams
      if (input.analysisDepth) data.analysisDepth = input.analysisDepth
      if (input.language) data.language = input.language

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data,
      })

      return { success: true }
    }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        pushEnabled: z.boolean().optional(),
        emailDigest: z.enum(["NONE", "DAILY", "WEEKLY"]).optional(),
        inAppAlerts: z.boolean().optional(),
        dndEnabled: z.boolean().optional(),
        dndStart: z.string().optional(),
        dndEnd: z.string().optional(),
        matchAlerts: z.boolean().optional(),
        agentAlerts: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        roomAlerts: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create notification preferences
      const existing = await ctx.db.notificationPreferences.findUnique({
        where: { userId: ctx.session.user.id },
      })

      const data: Record<string, unknown> = {}

      if (input.pushEnabled !== undefined) data.pushEnabled = input.pushEnabled
      if (input.emailDigest) data.emailDigest = input.emailDigest
      if (input.inAppAlerts !== undefined) data.inAppAlerts = input.inAppAlerts
      if (input.dndEnabled !== undefined) data.dndEnabled = input.dndEnabled
      if (input.dndStart) data.dndStart = input.dndStart
      if (input.dndEnd) data.dndEnd = input.dndEnd
      if (input.matchAlerts !== undefined) data.matchAlerts = input.matchAlerts
      if (input.agentAlerts !== undefined) data.agentAlerts = input.agentAlerts
      if (input.weeklyDigest !== undefined) data.weeklyDigest = input.weeklyDigest
      if (input.roomAlerts !== undefined) data.roomAlerts = input.roomAlerts

      if (existing) {
        await ctx.db.notificationPreferences.update({
          where: { userId: ctx.session.user.id },
          data,
        })
      } else {
        await ctx.db.notificationPreferences.create({
          data: {
            userId: ctx.session.user.id,
            ...data,
          },
        })
      }

      return { success: true }
    }),

  /**
   * Get personalized recommendations based on user preferences
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        expertiseLevel: true,
        favoriteSports: true,
        favoriteTeams: true,
        analysisDepth: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    // Build recommendations based on user preferences
    const recommendations = {
      suggestedAgents: [] as string[],
      suggestedMatches: [] as string[],
      suggestedContent: [] as string[],
    }

    // Suggest agents based on expertise level
    if (user.expertiseLevel === "BEGINNER") {
      recommendations.suggestedAgents = ["Scout", "Insider"]
    } else if (user.expertiseLevel === "INTERMEDIATE") {
      recommendations.suggestedAgents = ["Analyst", "Scout", "Strategist"]
    } else {
      recommendations.suggestedAgents = ["Strategist", "Analyst", "Insider", "Oracle"]
    }

    // Suggest analysis depth adjustments
    const suggestedDepth =
      user.expertiseLevel === "BEGINNER" ? "QUICK" :
      user.expertiseLevel === "INTERMEDIATE" ? "STANDARD" :
      "DETAILED"

    return {
      ...recommendations,
      suggestedDepth,
      currentDepth: user.analysisDepth,
    }
  }),

  /**
   * Reset preferences to default
   */
  resetPreferences: protectedProcedure.mutation(async ({ ctx }) => {
    // Reset user preferences
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        expertiseLevel: "BEGINNER",
        favoriteSports: [],
        favoriteTeams: [],
        analysisDepth: "STANDARD",
        language: "fr",
      },
    })

    // Reset notification preferences
    await ctx.db.notificationPreferences.upsert({
      where: { userId: ctx.session.user.id },
      create: {
        userId: ctx.session.user.id,
        pushEnabled: true,
        emailDigest: "NONE",
        inAppAlerts: true,
        dndEnabled: false,
        dndStart: "22:00",
        dndEnd: "08:00",
        matchAlerts: true,
        agentAlerts: true,
        weeklyDigest: false,
        roomAlerts: true,
      },
      update: {
        pushEnabled: true,
        emailDigest: "NONE",
        inAppAlerts: true,
        dndEnabled: false,
        dndStart: "22:00",
        dndEnd: "08:00",
        matchAlerts: true,
        agentAlerts: true,
        weeklyDigest: false,
        roomAlerts: true,
      },
    })

    return { success: true }
  }),
})
