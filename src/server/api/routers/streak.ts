/**
 * Epic 11 Story 11.6: Streak Tracking
 * tRPC router for daily streak management
 */

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import type { db } from "~/server/db"

/**
 * Check if two dates are consecutive days
 */
function isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
  const last = new Date(lastDate)
  last.setHours(0, 0, 0, 0)

  const current = new Date(currentDate)
  current.setHours(0, 0, 0, 0)

  const diffTime = current.getTime() - last.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays === 1
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const streakRouter = createTRPCRouter({
  /**
   * Get user's streak stats
   */
  getMyStreak: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const now = new Date()
    let streakStatus: "active" | "broken" | "new" = "new"

    if (user.lastStreakDate) {
      if (isSameDay(user.lastStreakDate, now)) {
        streakStatus = "active"
      } else if (isConsecutiveDay(user.lastStreakDate, now)) {
        streakStatus = "active"
      } else {
        streakStatus = "broken"
      }
    }

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastStreakDate: user.lastStreakDate,
      streakStatus,
      canIncrementToday: user.lastStreakDate ? !isSameDay(user.lastStreakDate, now) : true,
    }
  }),

  /**
   * Increment user's streak (called on qualifying actions)
   */
  incrementStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const now = new Date()

    // If already incremented today, return current streak
    if (user.lastStreakDate && isSameDay(user.lastStreakDate, now)) {
      return {
        success: true,
        alreadyIncrementedToday: true,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakIncremented: false,
      }
    }

    let newStreak = user.currentStreak

    // Check if streak continues or breaks
    if (user.lastStreakDate) {
      if (isConsecutiveDay(user.lastStreakDate, now)) {
        // Streak continues
        newStreak = user.currentStreak + 1
      } else {
        // Streak broken, restart
        newStreak = 1
      }
    } else {
      // First streak
      newStreak = 1
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak)

    // Update user streak
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: now,
      },
    })

    // Award points for streak milestones
    const pointsAwarded = await awardStreakPoints(ctx, newStreak)

    return {
      success: true,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      streakIncremented: true,
      pointsAwarded,
      isNewRecord: newStreak === newLongestStreak && newStreak > 1,
    }
  }),
})

/**
 * Award points for streak milestones
 */
async function awardStreakPoints(
  ctx: { db: typeof db; session: { user: { id: string } } },
  streak: number
): Promise<number> {
  // Award points for specific streak milestones
  const milestones: Record<number, number> = {
    3: 50, // 3-day streak
    7: 100, // 7-day streak
    14: 200, // 2-week streak
    30: 500, // 1-month streak
    60: 1000, // 2-month streak
    100: 2000, // 100-day streak
  }

  const pointsToAward = milestones[streak]

  if (pointsToAward) {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        points: { increment: pointsToAward },
        lifetimePoints: { increment: pointsToAward },
      },
    })

    await ctx.db.pointsTransaction.create({
      data: {
        userId: ctx.session.user.id,
        points: pointsToAward,
        actionType: "LEVEL_UP", // Reusing for streak milestones
        description: `Série de ${streak} jours`,
      },
    })

    return pointsToAward
  }

  return 0
}
