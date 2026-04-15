import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const matchRouter = createTRPCRouter({
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
});
