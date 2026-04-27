/**
 * Epic 13 Story 13.1: Global Search Interface
 * tRPC router for unified search across matches, rooms, experts, and analyses
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const searchRouter = createTRPCRouter({
  /**
   * Global search across all content types
   */
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().optional().default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input

      // Search matches
      const matches = await ctx.db.match.findMany({
        where: {
          OR: [
            { homeTeam: { name: { contains: query, mode: "insensitive" } } },
            { awayTeam: { name: { contains: query, mode: "insensitive" } } },
            { competition: { name: { contains: query, mode: "insensitive" } } },
          ],
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        take: limit,
        select: {
          id: true,
          kickoffTime: true,
          status: true,
          homeTeam: {
            select: { name: true },
          },
          awayTeam: {
            select: { name: true },
          },
          competition: {
            select: { name: true },
          },
        },
        orderBy: { kickoffTime: "asc" },
      })

      // Search rooms
      const rooms = await ctx.db.room.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          visibility: "PUBLIC",
          archivedAt: null,
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Search experts
      const experts = await ctx.db.expertProfile.findMany({
        where: {
          isActive: true,
          user: {
            OR: [
              { displayName: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
        },
        take: limit,
        select: {
          id: true,
          userId: true,
          followerCount: true,
          expertiseAreas: true,
          user: {
            select: {
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { followerCount: "desc" },
      })

      // Search user's conversation history
      const conversations = await ctx.db.agentConversation.findMany({
        where: {
          userId: ctx.session.user.id,
          title: { contains: query, mode: "insensitive" },
        },
        take: limit,
        select: {
          id: true,
          agentType: true,
          title: true,
          matchId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      })

      // Transform results to unified format
      const results: Array<{
        type: "match" | "room" | "expert" | "analysis"
        id: string
        title: string
        subtitle?: string
        url: string
      }> = [
        ...matches.map((m) => ({
          type: "match" as const,
          id: m.id,
          title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
          subtitle: `${m.competition.name} • ${new Date(m.kickoffTime).toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          url: m.status === "LIVE" ? `/live/${m.id}` : `/matches`,
        })),
        ...rooms.map((r) => ({
          type: "room" as const,
          id: r.id,
          title: r.name,
          subtitle: `${r.type} • ${r._count.members} membres`,
          url: `/salles/${r.id}`,
        })),
        ...experts.map((e) => ({
          type: "expert" as const,
          id: e.id,
          title: e.user.displayName ?? e.user.username,
          subtitle: `${e.followerCount} abonnés${e.expertiseAreas.length > 0 ? ` • ${e.expertiseAreas[0]}` : ""}`,
          url: `/experts?id=${e.userId}`,
        })),
        ...conversations.map((c) => ({
          type: "analysis" as const,
          id: c.id,
          title: c.title ?? `Conversation ${c.agentType}`,
          subtitle: `${c.agentType} • ${new Date(c.createdAt).toLocaleDateString("fr-FR")}`,
          url: `/agents/history?conversation=${c.id}`,
        })),
      ]

      return results
    }),
})
