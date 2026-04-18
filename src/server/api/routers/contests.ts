/**
 * Epic 11 Story 11.7: Prediction Contests
 * tRPC router for prediction contests and competitions
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import type { ContestStatus, ContestType } from "@prisma/client"

export const contestsRouter = createTRPCRouter({
  /**
   * Get all active and upcoming contests
   */
  getContests: publicProcedure
    .input(
      z.object({
        status: z.enum(["UPCOMING", "ACTIVE", "ENDED", "COMPLETED", "CANCELLED"]).optional(),
        type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SPECIAL_EVENT"]).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: {
        status?: ContestStatus
        type?: ContestType
      } = {}

      if (input.status) where.status = input.status
      if (input.type) where.type = input.type

      const contests = await ctx.db.predictionContest.findMany({
        where,
        orderBy: [{ startDate: "asc" }],
        take: input.limit,
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      })

      return contests.map((contest) => ({
        ...contest,
        participantCount: contest._count.entries,
      }))
    }),

  /**
   * Get specific contest details
   */
  getContest: publicProcedure
    .input(z.object({ contestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const contest = await ctx.db.predictionContest.findUnique({
        where: { id: input.contestId },
        include: {
          prizes: {
            orderBy: { rankStart: "asc" },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      })

      if (!contest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contest not found",
        })
      }

      // Check if user is participating (if authenticated)
      let userEntry = null
      if (ctx.session?.user) {
        userEntry = await ctx.db.contestEntry.findUnique({
          where: {
            contestId_userId: {
              contestId: input.contestId,
              userId: ctx.session.user.id,
            },
          },
        })
      }

      return {
        ...contest,
        participantCount: contest._count.entries,
        isParticipating: !!userEntry,
        userRank: userEntry?.rank ?? null,
      }
    }),

  /**
   * Join a contest
   */
  joinContest: protectedProcedure
    .input(z.object({ contestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get contest details
      const contest = await ctx.db.predictionContest.findUnique({
        where: { id: input.contestId },
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      })

      if (!contest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contest not found",
        })
      }

      // Check contest status
      if (contest.status !== "UPCOMING" && contest.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot join this contest",
        })
      }

      // Check if already joined
      const existingEntry = await ctx.db.contestEntry.findUnique({
        where: {
          contestId_userId: {
            contestId: input.contestId,
            userId,
          },
        },
      })

      if (existingEntry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already joined this contest",
        })
      }

      // Check max participants
      if (contest.maxParticipants && contest._count.entries >= contest.maxParticipants) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contest is full",
        })
      }

      // Check user has enough points for entry fee
      if (contest.entryFee > 0) {
        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { points: true },
        })

        if (!user || user.points < contest.entryFee) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient points",
          })
        }

        // Deduct entry fee
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            points: { decrement: contest.entryFee },
          },
        })

        // Record transaction
        await ctx.db.pointsTransaction.create({
          data: {
            userId,
            points: -contest.entryFee,
            actionType: "REWARD_REDEMPTION",
            description: `Entrée concours: ${contest.name}`,
            relatedEntityId: contest.id,
          },
        })
      }

      // Create entry
      const entry = await ctx.db.contestEntry.create({
        data: {
          contestId: input.contestId,
          userId,
        },
      })

      return {
        success: true,
        entryId: entry.id,
      }
    }),

  /**
   * Get contest leaderboard
   */
  getContestLeaderboard: publicProcedure
    .input(
      z.object({
        contestId: z.string(),
        limit: z.number().min(10).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.contestEntry.findMany({
        where: { contestId: input.contestId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              level: true,
            },
          },
        },
        orderBy: [{ totalPoints: "desc" }, { joinedAt: "asc" }],
        take: input.limit,
      })

      return entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.user.id,
        username: entry.user.username,
        displayName: entry.user.displayName ?? entry.user.username,
        avatarUrl: entry.user.avatarUrl,
        level: entry.user.level,
        totalPoints: entry.totalPoints,
        isCurrentUser: ctx.session?.user?.id === entry.user.id,
      }))
    }),

  /**
   * Submit prediction for a contest match
   */
  submitPrediction: protectedProcedure
    .input(
      z.object({
        contestId: z.string(),
        matchId: z.string(),
        prediction: z.enum(["HOME", "DRAW", "AWAY"]),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get user's contest entry
      const entry = await ctx.db.contestEntry.findUnique({
        where: {
          contestId_userId: {
            contestId: input.contestId,
            userId,
          },
        },
      })

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not participating in this contest",
        })
      }

      // Check if prediction already exists
      const existingPrediction = await ctx.db.contestPrediction.findUnique({
        where: {
          entryId_matchId: {
            entryId: entry.id,
            matchId: input.matchId,
          },
        },
      })

      if (existingPrediction) {
        // Update existing prediction
        await ctx.db.contestPrediction.update({
          where: { id: existingPrediction.id },
          data: {
            prediction: input.prediction,
            metadata: input.metadata,
          },
        })
      } else {
        // Create new prediction
        await ctx.db.contestPrediction.create({
          data: {
            entryId: entry.id,
            matchId: input.matchId,
            prediction: input.prediction,
            metadata: input.metadata,
          },
        })
      }

      return {
        success: true,
      }
    }),

  /**
   * Get user's contest predictions
   */
  getMyPredictions: protectedProcedure
    .input(z.object({ contestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const entry = await ctx.db.contestEntry.findUnique({
        where: {
          contestId_userId: {
            contestId: input.contestId,
            userId,
          },
        },
        include: {
          predictions: true,
        },
      })

      if (!entry) {
        return {
          predictions: [],
          totalPoints: 0,
        }
      }

      return {
        predictions: entry.predictions,
        totalPoints: entry.totalPoints,
      }
    }),

  /**
   * Claim contest prize
   */
  claimPrize: protectedProcedure
    .input(z.object({ contestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get contest and user entry
      const contest = await ctx.db.predictionContest.findUnique({
        where: { id: input.contestId },
        include: {
          prizes: true,
        },
      })

      if (!contest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contest not found",
        })
      }

      if (contest.status !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contest not yet completed",
        })
      }

      const entry = await ctx.db.contestEntry.findUnique({
        where: {
          contestId_userId: {
            contestId: input.contestId,
            userId,
          },
        },
      })

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not participating in this contest",
        })
      }

      if (entry.prizeClaimed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Prize already claimed",
        })
      }

      if (!entry.rank) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No rank assigned",
        })
      }

      // Find applicable prize
      const prize = contest.prizes.find(
        (p) => entry.rank! >= p.rankStart && entry.rank! <= p.rankEnd
      )

      if (!prize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No prize for this rank",
        })
      }

      // Award prize
      await ctx.db.user.update({
        where: { id: userId },
        data: {
          points: { increment: prize.reward },
          lifetimePoints: { increment: prize.reward },
        },
      })

      await ctx.db.pointsTransaction.create({
        data: {
          userId,
          points: prize.reward,
          actionType: "CORRECT_PREDICTION",
          description: `Prix concours: ${contest.name} (Rang ${entry.rank})`,
          relatedEntityId: contest.id,
        },
      })

      // Mark prize as claimed
      await ctx.db.contestEntry.update({
        where: { id: entry.id },
        data: { prizeClaimed: true },
      })

      return {
        success: true,
        prizeAwarded: prize.reward,
        rank: entry.rank,
      }
    }),
})
