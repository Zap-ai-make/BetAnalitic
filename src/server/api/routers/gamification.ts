/**
 * Epic 11 Story 11.3: Gamification Points System
 * tRPC router for points, levels, and achievements
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import type { PointsActionType } from "@prisma/client"

// Level calculation: Level = floor(sqrt(totalPoints / 100))
// Level 1: 0-99 points
// Level 2: 100-399 points
// Level 3: 400-899 points
// Level 4: 900-1599 points
// Level 5: 1600+ points
function calculateLevel(totalPoints: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalPoints / 100)))
}

// Points required for next level
function pointsForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) ** 2 * 100
}

export const gamificationRouter = createTRPCRouter({
  /**
   * Get user's gamification stats
   */
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        points: true,
        lifetimePoints: true,
        level: true,
        lastDailyLogin: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const pointsForNext = pointsForNextLevel(user.level)
    const progressToNext = user.points % pointsForNext
    const progressPercentage = (progressToNext / pointsForNext) * 100

    // Check if daily login is available
    const lastLogin = user.lastDailyLogin
    const now = new Date()
    const canClaimDaily = !lastLogin ||
      (now.getTime() - lastLogin.getTime()) > 24 * 60 * 60 * 1000

    return {
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      level: user.level,
      pointsForNext,
      progressToNext,
      progressPercentage,
      canClaimDaily,
    }
  }),

  /**
   * Get points transaction history
   */
  getPointsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.pointsTransaction.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.db.pointsTransaction.count({
        where: { userId: ctx.session.user.id },
      })

      return {
        transactions,
        total,
        hasMore: total > input.offset + input.limit,
      }
    }),

  /**
   * Claim daily login reward
   */
  claimDailyLogin: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        lastDailyLogin: true,
        points: true,
        lifetimePoints: true,
        level: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    // Check if user can claim (24h cooldown)
    const lastLogin = user.lastDailyLogin
    const now = new Date()
    if (lastLogin && (now.getTime() - lastLogin.getTime()) < 24 * 60 * 60 * 1000) {
      const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (now.getTime() - lastLogin.getTime())) / (60 * 60 * 1000))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Déjà réclamé. Revenez dans ${hoursLeft}h`,
      })
    }

    const pointsAwarded = 10
    const newPoints = user.points + pointsAwarded
    const newLifetimePoints = user.lifetimePoints + pointsAwarded
    const newLevel = calculateLevel(newLifetimePoints)
    const leveledUp = newLevel > user.level

    // Award points and update last login
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        level: newLevel,
        lastDailyLogin: now,
      },
    })

    // Record transaction
    await ctx.db.pointsTransaction.create({
      data: {
        userId: ctx.session.user.id,
        points: pointsAwarded,
        actionType: "DAILY_LOGIN",
        description: "Connexion quotidienne",
      },
    })

    // If leveled up, award bonus points
    if (leveledUp) {
      const levelUpBonus = newLevel * 50
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          points: { increment: levelUpBonus },
          lifetimePoints: { increment: levelUpBonus },
        },
      })

      await ctx.db.pointsTransaction.create({
        data: {
          userId: ctx.session.user.id,
          points: levelUpBonus,
          actionType: "LEVEL_UP",
          description: `Passage niveau ${newLevel}`,
        },
      })
    }

    // Increment streak (Story 11.6)
    const { streakRouter } = await import("~/server/api/routers/streak")
    const streakCaller = streakRouter.createCaller(ctx)
    const streakResult = await streakCaller.incrementStreak()

    return {
      success: true,
      pointsAwarded,
      newPoints,
      newLevel,
      leveledUp,
      levelUpBonus: leveledUp ? newLevel * 50 : 0,
      streakIncremented: streakResult.streakIncremented,
      currentStreak: streakResult.currentStreak,
      streakPointsAwarded: streakResult.pointsAwarded,
    }
  }),

  /**
   * Award points for an action (internal use by other routers)
   */
  awardPoints: protectedProcedure
    .input(
      z.object({
        actionType: z.enum([
          "DAILY_LOGIN",
          "AGENT_INVOCATION",
          "SHARE_ANALYSIS",
          "CORRECT_PREDICTION",
          "SUCCESSFUL_REFERRAL",
          "LEVEL_UP",
          "MANUAL_ADJUSTMENT",
          "REWARD_REDEMPTION",
        ]),
        points: z.number(),
        description: z.string().optional(),
        relatedEntityId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          points: true,
          lifetimePoints: true,
          level: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      const newPoints = Math.max(0, user.points + input.points)
      const newLifetimePoints = input.points > 0
        ? user.lifetimePoints + input.points
        : user.lifetimePoints
      const newLevel = calculateLevel(newLifetimePoints)
      const leveledUp = newLevel > user.level

      // Update user points
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          points: newPoints,
          lifetimePoints: newLifetimePoints,
          level: newLevel,
        },
      })

      // Record transaction
      await ctx.db.pointsTransaction.create({
        data: {
          userId: ctx.session.user.id,
          points: input.points,
          actionType: input.actionType as PointsActionType,
          description: input.description,
          relatedEntityId: input.relatedEntityId,
        },
      })

      // If leveled up, award bonus points
      if (leveledUp && input.points > 0) {
        const levelUpBonus = newLevel * 50
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            points: { increment: levelUpBonus },
            lifetimePoints: { increment: levelUpBonus },
          },
        })

        await ctx.db.pointsTransaction.create({
          data: {
            userId: ctx.session.user.id,
            points: levelUpBonus,
            actionType: "LEVEL_UP",
            description: `Passage niveau ${newLevel}`,
          },
        })
      }

      return {
        success: true,
        pointsAwarded: input.points,
        newPoints,
        newLevel,
        leveledUp,
        levelUpBonus: leveledUp && input.points > 0 ? newLevel * 50 : 0,
      }
    }),

  /**
   * Get leaderboard (Story 11.4)
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        type: z.enum(["points", "level", "lifetime"]),
        timeframe: z.enum(["weekly", "monthly", "all-time"]).default("all-time"),
        limit: z.number().min(10).max(100).default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id

      // Determine sort field based on type
      const orderBy = input.type === "points"
        ? { points: "desc" as const }
        : input.type === "level"
        ? { level: "desc" as const }
        : { lifetimePoints: "desc" as const }

      // Get top users
      const topUsers = await ctx.db.user.findMany({
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          points: true,
          level: true,
          lifetimePoints: true,
        },
        orderBy,
        take: input.limit,
      })

      // Find current user's rank
      const currentUser = await ctx.db.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          points: true,
          level: true,
          lifetimePoints: true,
        },
      })

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Calculate user's rank
      const getValue = (user: typeof currentUser) => {
        return input.type === "points"
          ? user.points
          : input.type === "level"
          ? user.level
          : user.lifetimePoints
      }

      const currentValue = getValue(currentUser)
      const usersAbove = await ctx.db.user.count({
        where: input.type === "points"
          ? { points: { gt: currentValue } }
          : input.type === "level"
          ? { level: { gt: currentValue } }
          : { lifetimePoints: { gt: currentValue } },
      })

      const currentUserRank = usersAbove + 1
      const isInTop100 = currentUserRank <= input.limit

      // Format leaderboard entries
      const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName ?? user.username,
        avatarUrl: user.avatarUrl,
        score: getValue(user),
        level: user.level,
        isCurrentUser: user.id === currentUserId,
      }))

      // Add current user if not in top 100
      if (!isInTop100) {
        leaderboard.push({
          rank: currentUserRank,
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName ?? currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          score: getValue(currentUser),
          level: currentUser.level,
          isCurrentUser: true,
        })
      }

      return {
        leaderboard,
        currentUserRank,
        totalUsers: await ctx.db.user.count(),
        type: input.type,
      }
    }),
})
