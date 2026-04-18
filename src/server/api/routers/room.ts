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
   * Story 6.11: Invite user to room
   */
  inviteUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner or has invite permission
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          members: {
            where: { userId },
          },
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const membership = room.members[0]
      const settings = room.settings as { membersCanInvite?: boolean }

      if (room.ownerId !== userId && membership?.role !== "ADMIN" && !settings.membersCanInvite) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to invite users",
        })
      }

      // Find user to invite
      const invitee = await ctx.db.user.findUnique({
        where: { username: input.username },
      })

      if (!invitee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Check if already a member
      const existingMember = await ctx.db.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId: invitee.id,
          },
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already a member",
        })
      }

      // Add as member
      await ctx.db.roomMember.create({
        data: {
          roomId: input.roomId,
          userId: invitee.id,
          role: "MEMBER",
        },
      })

      return { success: true, username: invitee.username }
    }),

  /**
   * Story 6.11: Join room via invite link
   */
  joinViaInvite: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      if (room.visibility === "PRIVATE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This room is private",
        })
      }

      // Check if already a member
      const existingMember = await ctx.db.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId,
          },
        },
      })

      if (existingMember) {
        return room
      }

      // Add as member
      await ctx.db.roomMember.create({
        data: {
          roomId: input.roomId,
          userId,
          role: "MEMBER",
        },
      })

      return room
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
        ticketId: z.string().optional(), // Story 6.10: Share ticket
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
          metadata: input.ticketId ? { ticketId: input.ticketId } : undefined,
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

  /**
   * Story 6.12: Kick/ban user (Owner/Admin only)
   */
  kickUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner or admin
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          members: {
            where: { userId },
          },
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const myMembership = room.members[0]

      if (room.ownerId !== userId && myMembership?.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can kick users",
        })
      }

      // Cannot kick the owner
      if (input.targetUserId === room.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot kick the room owner",
        })
      }

      // Remove membership
      await ctx.db.roomMember.delete({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId: input.targetUserId,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Story 6.12: Promote user to admin
   */
  promoteToAdmin: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      if (room.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can promote users",
        })
      }

      // Update role
      await ctx.db.roomMember.update({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId: input.targetUserId,
          },
        },
        data: {
          role: "ADMIN",
        },
      })

      return { success: true }
    }),

  /**
   * Story 6.12: Delete message (Owner/Admin only)
   */
  deleteMessage: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        messageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner, admin, or message author
      const message = await ctx.db.roomMessage.findUnique({
        where: { id: input.messageId },
        include: {
          room: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
        },
      })

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        })
      }

      const myMembership = message.room.members[0]
      const isOwner = message.room.ownerId === userId
      const isAdmin = myMembership?.role === "ADMIN"
      const isAuthor = message.userId === userId

      if (!isOwner && !isAdmin && !isAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this message",
        })
      }

      // Soft delete
      await ctx.db.roomMessage.update({
        where: { id: input.messageId },
        data: { isDeleted: true },
      })

      return { success: true }
    }),

  /**
   * Story 6.13: Get room analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is owner or admin
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          members: {
            where: { userId },
          },
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const myMembership = room.members[0]

      if (room.ownerId !== userId && myMembership?.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can view analytics",
        })
      }

      // Get stats
      const totalMessages = await ctx.db.roomMessage.count({
        where: {
          roomId: input.roomId,
          isDeleted: false,
        },
      })

      const totalMembers = await ctx.db.roomMember.count({
        where: { roomId: input.roomId },
      })

      // Top contributors
      const topContributors = await ctx.db.roomMessage.groupBy({
        by: ["userId"],
        where: {
          roomId: input.roomId,
          isDeleted: false,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      })

      const contributorDetails = await ctx.db.user.findMany({
        where: {
          id: {
            in: topContributors.map((c) => c.userId),
          },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      })

      const contributorsWithCounts = topContributors.map((c) => {
        const user = contributorDetails.find((u) => u.id === c.userId)
        return {
          userId: c.userId,
          userName: user?.displayName ?? user?.username ?? "Unknown",
          userAvatar: user?.avatarUrl,
          messageCount: c._count.id,
        }
      })

      // Activity by day (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentMessages = await ctx.db.roomMessage.findMany({
        where: {
          roomId: input.roomId,
          isDeleted: false,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      })

      const activityByDay = recentMessages.reduce((acc, msg) => {
        const day = msg.createdAt.toISOString().split("T")[0]!
        acc[day] = (acc[day] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalMessages,
        totalMembers,
        topContributors: contributorsWithCounts,
        activityByDay,
        createdAt: room.createdAt,
      }
    }),

  /**
   * Story 6.14: Mark room as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add lastReadAt field to RoomMember model to track read status
      // For now, just return success
      return { success: true }
    }),

  /**
   * Story 6.14: Get unread count for user's rooms
   */
  getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const memberships = await ctx.db.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            messages: {
              where: {
                isDeleted: false,
                userId: { not: userId }, // Don't count own messages
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    })

    // TODO: Add lastReadAt field to RoomMember to properly track unread messages
    // For now, return 0 for all unread counts
    const unreadCounts = memberships.map((m) => ({
      roomId: m.roomId,
      unread: 0,
    }))

    return unreadCounts
  }),

  /**
   * Story 6.15: Get archived rooms
   */
  getArchived: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const memberships = await ctx.db.roomMember.findMany({
        where: {
          userId,
          room: {
            archivedAt: { not: null },
          },
        },
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
          room: {
            archivedAt: "desc",
          },
        },
        take: input.limit,
      })

      return memberships.map((m) => ({
        ...m.room,
        memberCount: m.room._count.members,
        messageCount: m.room._count.messages,
        myRole: m.role,
      }))
    }),

  /**
   * Story 6.15: Archive room (Owner only)
   */
  archive: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      if (room.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can archive",
        })
      }

      await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          archivedAt: new Date(),
        },
      })

      return { success: true }
    }),

  /**
   * Story 6.15: Unarchive room (Owner only)
   */
  unarchive: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      if (room.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can unarchive",
        })
      }

      await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          archivedAt: null,
        },
      })

      return { success: true }
    }),
})
