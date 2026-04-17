/**
 * Room tRPC Router
 * Story 6.3+: Room operations (join, create, manage, etc.)
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"

export const roomRouter = createTRPCRouter({
  /**
   * Story 6.3: Join or create official match room
   */
  joinMatchRoom: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { matchId } = input
      const userId = ctx.session.user.id

      // Get match details
      const match = await ctx.db.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        })
      }

      // Check if official room already exists
      let room = await ctx.db.room.findFirst({
        where: {
          matchId,
          type: "OFFICIAL",
        },
      })

      // Create official room if doesn't exist
      if (!room) {
        room = await ctx.db.room.create({
          data: {
            name: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
            description: `Salle officielle pour ${match.homeTeam.name} vs ${match.awayTeam.name}`,
            color: "#00D4FF",
            badge: "⚽",
            visibility: "PUBLIC",
            type: "OFFICIAL",
            ownerId: userId, // First user becomes owner
            matchId,
            maxMembers: 1000, // Official rooms have higher limit
          },
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.db.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: room.id,
            userId,
          },
        },
      })

      if (existingMember) {
        // Already a member, just return the room
        return room
      }

      // Add user as member
      await ctx.db.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role: room.ownerId === userId ? "OWNER" : "MEMBER",
        },
      })

      return room
    }),

  /**
   * Get user's joined rooms
   */
  getMyRooms: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const memberships = await ctx.db.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
              },
            },
            _count: {
              select: {
                members: true,
                messages: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    })

    return memberships.map((m) => ({
      ...m.room,
      memberCount: m.room._count.members,
      messageCount: m.room._count.messages,
      myRole: m.role,
    }))
  }),

  /**
   * Get room by ID
   */
  getById: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
          _count: {
            select: {
              members: true,
              messages: true,
            },
          },
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      return {
        ...room,
        memberCount: room._count.members,
        messageCount: room._count.messages,
      }
    }),

  /**
   * Leave a room
   */
  leave: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is room owner
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (room?.ownerId === userId && room.type === "PRIVATE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Owner cannot leave their own room. Delete it instead.",
        })
      }

      // Remove membership
      await ctx.db.roomMember.delete({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Story 6.4: Create private room (Premium only)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        description: z.string().max(200).optional(),
        color: z.string().default("#00D4FF"),
        badge: z.string().optional(),
        visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).default("PUBLIC"),
        maxMembers: z.number().min(2).max(100).default(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is Premium/Expert
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      })

      if (user?.subscriptionTier === "FREE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Premium subscription required to create private rooms",
        })
      }

      // Check room limit (max 5 for Premium)
      const ownedRooms = await ctx.db.room.count({
        where: {
          ownerId: userId,
          type: "PRIVATE",
          archivedAt: null,
        },
      })

      if (ownedRooms >= 5) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Maximum 5 active private rooms allowed",
        })
      }

      // Create room
      const room = await ctx.db.room.create({
        data: {
          ...input,
          type: "PRIVATE",
          ownerId: userId,
        },
      })

      // Add owner as first member
      await ctx.db.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role: "OWNER",
        },
      })

      return room
    }),

  /**
   * Story 6.6: Update room settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        settings: z.object({
          membersCanInvite: z.boolean().optional(),
          membersCanInvokeAgents: z.boolean().optional(),
          dataOnlyMode: z.boolean().optional(),
        }),
        maxMembers: z.number().min(2).max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (room?.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can update settings",
        })
      }

      // Update room
      const updated = await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          settings: input.settings,
          maxMembers: input.maxMembers,
        },
      })

      return updated
    }),

  /**
   * Story 6.7: Discover public rooms
   */
  discover: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const rooms = await ctx.db.room.findMany({
        where: {
          visibility: "PUBLIC",
          archivedAt: null,
          name: input.search
            ? { contains: input.search, mode: "insensitive" }
            : undefined,
        },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
              messages: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" },
        ],
        take: input.limit,
      })

      return rooms.map((room) => ({
        ...room,
        memberCount: room._count.members,
        messageCount: room._count.messages,
      }))
    }),

  /**
   * Story 6.5: Get room members
   */
  getMembers: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.roomMember.findMany({
        where: { roomId: input.roomId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      })

      return members.map((m) => ({
        userId: m.user.id,
        userName: m.user.displayName ?? m.user.username,
        userAvatar: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.joinedAt,
        isOnline: false, // TODO: integrate with real-time presence
      }))
    }),

  /**
   * Story 6.8: Get room messages
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.roomMessage.findMany({
        where: {
          roomId: input.roomId,
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: string | undefined = undefined
      if (messages.length > input.limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages: messages.reverse().map((m) => ({
          id: m.id,
          roomId: m.roomId,
          userId: m.userId,
          userName: m.user.displayName ?? m.user.username,
          userAvatar: m.user.avatarUrl,
          type: m.type,
          content: m.content,
          agentId: m.agentId,
          replyToId: m.replyToId,
          reactions: m.reactions,
          createdAt: m.createdAt,
          editedAt: m.editedAt,
        })),
        nextCursor,
      }
    }),

  /**
   * Story 6.8: Send message in room
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string().min(1).max(2000),
        type: z.enum(["TEXT", "AGENT", "SYSTEM"]).default("TEXT"),
        agentId: z.string().optional(),
        replyToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is member of room
      const membership = await ctx.db.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member of this room to send messages",
        })
      }

      // Create message
      const message = await ctx.db.roomMessage.create({
        data: {
          roomId: input.roomId,
          userId,
          content: input.content,
          type: input.type,
          agentId: input.agentId,
          replyToId: input.replyToId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      return {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        userName: message.user.displayName ?? message.user.username,
        userAvatar: message.user.avatarUrl,
        type: message.type,
        content: message.content,
        agentId: message.agentId,
        replyToId: message.replyToId,
        reactions: message.reactions,
        createdAt: message.createdAt,
      }
    }),
})
