import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const matchRouter = createTRPCRouter({
  /**
   * Get match by ID
   * Story 7.3: Support Live Mode screen
   */
  getById: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({
        where: { id: input.matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          tags: true,
        },
      })

      if (!match) {
        throw new Error("Match not found")
      }

      return {
        ...match,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.homeScore ?? undefined,
        awayScore: match.awayScore ?? undefined,
      }
    }),

  /**
   * Get today's matches
   */
  getTodaysMatches: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const matches = await ctx.db.match.findMany({
      where: {
        kickoffTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        tags: true,
      },
      orderBy: [
        // LIVE matches first
        { status: "desc" },
        // Then by kickoff time
        { kickoffTime: "asc" },
      ],
    });

    // Transform and add social proof counter (placeholder)
    return matches.map((match) => ({
      ...match,
      analysisCount: Math.floor(Math.random() * 50) + 1, // TODO: Real counter
    }));
  }),

  /**
   * Get upcoming matches
   */
  getUpcomingMatches: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        competitionIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const matches = await ctx.db.match.findMany({
        where: {
          kickoffTime: {
            gte: now,
          },
          competitionId: input.competitionIds?.length
            ? { in: input.competitionIds }
            : undefined,
          status: "SCHEDULED",
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          tags: true,
        },
        orderBy: {
          kickoffTime: "asc",
        },
        take: input.limit,
      });

      return matches.map((match) => ({
        ...match,
        analysisCount: Math.floor(Math.random() * 50) + 1,
      }));
    }),

  /**
   * Get live matches
   */
  getLiveMatches: protectedProcedure.query(async ({ ctx }) => {
    const matches = await ctx.db.match.findMany({
      where: {
        status: {
          in: ["LIVE", "HALFTIME"],
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        tags: true,
      },
      orderBy: {
        kickoffTime: "desc",
      },
    });

    return matches.map((match) => ({
      ...match,
      analysisCount: Math.floor(Math.random() * 100) + 10,
    }));
  }),

  /**
   * Get match by ID
   */
  getMatch: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({
        where: { id: input.id },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          tags: true,
        },
      });

      if (!match) {
        throw new Error("Match not found");
      }

      return {
        ...match,
        analysisCount: Math.floor(Math.random() * 50) + 1,
      };
    }),

  /**
   * Get matches by date range
   */
  getMatchesByDateRange: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        competitionIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const matches = await ctx.db.match.findMany({
        where: {
          kickoffTime: {
            gte: input.from,
            lte: input.to,
          },
          competitionId: input.competitionIds?.length
            ? { in: input.competitionIds }
            : undefined,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          tags: true,
        },
        orderBy: {
          kickoffTime: "asc",
        },
      });

      return matches.map((match) => ({
        ...match,
        analysisCount: Math.floor(Math.random() * 50) + 1,
      }));
    }),

  /**
   * Get all competitions
   */
  getCompetitions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.competition.findMany({
      orderBy: [{ tier: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        country: true,
        logoUrl: true,
        tier: true,
      },
    });
  }),

  /**
   * Get matches with infinite scroll (cursor-based pagination)
   */
  getMatchesInfinite: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(), // Match ID cursor
        from: z.date(),
        to: z.date(),
        competitionIds: z.array(z.string()).optional(),
        liveOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const matches = await ctx.db.match.findMany({
        where: {
          kickoffTime: {
            gte: input.from,
            lte: input.to,
          },
          competitionId: input.competitionIds?.length
            ? { in: input.competitionIds }
            : undefined,
          ...(input.liveOnly && {
            status: {
              in: ["LIVE", "HALFTIME"],
            },
          }),
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          tags: true,
        },
        orderBy: {
          kickoffTime: "asc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (matches.length > input.limit) {
        const nextItem = matches.pop();
        nextCursor = nextItem?.id;
      }

      return {
        matches: matches.map((match) => ({
          ...match,
          analysisCount: Math.floor(Math.random() * 50) + 1,
        })),
        nextCursor,
      };
    }),

  /** GET /api/trpc/match.getAIPicks — signaux IA du jour */
  getAIPicks: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const base = input.date ? new Date(input.date) : new Date()
      const dayStart = new Date(base)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(base)
      dayEnd.setHours(23, 59, 59, 999)

      return ctx.db.aIPick.findMany({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          expiresAt: { gt: new Date() },
        },
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              competition: true,
            },
          },
        },
        orderBy: { confidence: "desc" },
      })
    }),

  /** GET /api/trpc/match.getAIPicksStats — perf historique IA */
  getAIPicksStats: protectedProcedure.query(async ({ ctx }) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [yesterdayPicks, last30Picks] = await Promise.all([
      ctx.db.aIPick.findMany({
        where: { createdAt: { gte: yesterday, lte: yesterdayEnd }, isCorrect: { not: null } },
        select: { isCorrect: true },
      }),
      ctx.db.aIPick.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, isCorrect: { not: null } },
        select: { isCorrect: true },
      }),
    ])

    const yesterdayCorrect = yesterdayPicks.filter((p) => p.isCorrect).length
    const last30Correct = last30Picks.filter((p) => p.isCorrect).length

    return {
      yesterday: { correct: yesterdayCorrect, total: yesterdayPicks.length },
      last30Days: {
        correct: last30Correct,
        total: last30Picks.length,
        accuracy: last30Picks.length > 0 ? Math.round((last30Correct / last30Picks.length) * 100) : null,
      },
    }
  }),
});
