/**
 * Room tRPC Router
 * Story 6.3+: Room operations (join, create, manage, etc.)
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { type PrismaClient } from "@prisma/client"
import { getEnabledAgents } from "~/lib/agents/config"

async function createDefaultChannels(db: PrismaClient, roomId: string) {
  const existing = await db.roomChannel.count({ where: { roomId } })
  if (existing > 0) return
  await db.roomChannel.createMany({
    data: [
      { roomId, type: "GENERAL", slug: "general", name: "Général" },
      { roomId, type: "ANNONCE", slug: "annonce", name: "Annonces" },
      { roomId, type: "ANALYSE", slug: "analyse", name: "Analyse" },
    ],
  })
}

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
        await createDefaultChannels(ctx.db, room.id)
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
   * Epic 13 Story 13.3: Get all rooms for discovery (public + private/invite-only)
   */
  getPublicRooms: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const rooms = await ctx.db.room.findMany({
      where: { archivedAt: null },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: [
        { type: "asc" }, // OFFICIAL first
        { createdAt: "desc" },
      ],
      take: 50,
    })

    return rooms.map(({ members, _count, ...r }) => ({
      ...r,
      memberCount: _count.members,
      messageCount: _count.messages,
      isMember: members.length > 0,
      myRole: members[0]?.role ?? null,
    }))
  }),

  /**
   * Get room by ID
   */
  getById: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

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
          members: {
            where: { userId },
            select: { role: true },
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" })
      }

      const isMember = room.members.length > 0
      if (room.visibility !== "PUBLIC" && !isMember) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Room is private" })
      }

      const { members, _count, ...roomData } = room
      return {
        ...roomData,
        memberCount: _count.members + 14, // 14 virtual agent members
        messageCount: _count.messages,
        isMember,
        myRole: members[0]?.role ?? null,
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

      // Check room limit (max 5 per user)
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

      await createDefaultChannels(ctx.db, room.id)

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

  updateRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        name: z.string().min(3).max(50).optional(),
        description: z.string().max(200).optional().nullable(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        badge: z.string().max(4).optional().nullable(),
        coverImage: z.string().url().optional().nullable(),
        visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const room = await ctx.db.room.findUnique({ where: { id: input.roomId } })
      if (room?.ownerId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "Owner only" })
      const { roomId, ...data } = input
      return ctx.db.room.update({ where: { id: roomId }, data })
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

      const humanMembers = members.map((m) => ({
        userId: m.user.id,
        userName: m.user.displayName ?? m.user.username,
        userAvatar: m.user.avatarUrl as string | null,
        role: m.role,
        joinedAt: m.joinedAt,
        isOnline: false,
        isAgent: false,
        agentEmoji: null as string | null,
        agentColor: null as string | null,
        agentDescription: null as string | null,
      }))

      const agentMembers = getEnabledAgents().map((agent) => ({
        userId: `agent:${agent.id}`,
        userName: agent.name,
        userAvatar: null as string | null,
        role: "MEMBER" as const,
        joinedAt: new Date(0),
        isOnline: true,
        isAgent: true,
        agentEmoji: agent.emoji,
        agentColor: agent.color,
        agentDescription: agent.description as string | null,
      }))

      return [...humanMembers, ...agentMembers]
    }),

  /**
   * Story 6.8: Get room messages (membership-gated for private rooms)
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        channelId: z.string().optional(),
        ticketId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify membership for non-public rooms
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        select: { visibility: true },
      })
      if (room?.visibility !== "PUBLIC") {
        const membership = await ctx.db.roomMember.findUnique({
          where: { roomId_userId: { roomId: input.roomId, userId } },
        })
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })
        }
      }

      const messages = await ctx.db.roomMessage.findMany({
        where: {
          roomId: input.roomId,
          channelId: input.channelId ?? undefined,
          ticketId: input.ticketId ?? undefined,
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
          mentions: m.mentions,
          isPinned: m.isPinned,
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
        channelId: z.string().optional(),
        ticketId: z.string().optional(),
        content: z.string().min(1).max(2000),
        type: z.enum(["TEXT", "AGENT", "SYSTEM"]).default("TEXT"),
        agentId: z.string().optional(),
        replyToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user is member of room
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          members: { where: { userId } },
        },
      })

      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" })
      if (room.archivedAt) throw new TRPCError({ code: "FORBIDDEN", message: "Room is archived" })
      if (!room.members.length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You must be a member of this room to send messages" })
      }

      // Enforce channel write permissions
      if (input.channelId) {
        const channel = await ctx.db.roomChannel.findUnique({ where: { id: input.channelId } })
        if (channel && (channel.type === "GENERAL" || channel.type === "ANNONCE")) {
          const myRole = room.members[0]?.role
          if (myRole === "MEMBER") {
            throw new TRPCError({ code: "FORBIDDEN", message: "Seul le créateur peut écrire dans ce canal" })
          }
        }
      }

      // Verify ticket is open if ticketId provided
      if (input.ticketId) {
        const ticket = await ctx.db.analyseTicket.findUnique({ where: { id: input.ticketId } })
        if (!ticket || ticket.status === "ARCHIVED") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Ce ticket est archivé" })
        }
      }

      // Parse @mentions from content
      const mentionMatches = [...input.content.matchAll(/@(\w+)/g)]
      const mentionedUsernames = mentionMatches.map((m) => m[1]!).filter(Boolean)
      const mentionedUserIds: string[] = []
      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await ctx.db.user.findMany({
          where: { username: { in: mentionedUsernames } },
          select: { id: true },
        })
        mentionedUserIds.push(...mentionedUsers.map((u) => u.id))
      }

      // Create message
      const message = await ctx.db.roomMessage.create({
        data: {
          roomId: input.roomId,
          channelId: input.channelId,
          ticketId: input.ticketId,
          userId,
          content: input.content,
          type: input.type,
          agentId: input.agentId,
          replyToId: input.replyToId,
          mentions: mentionedUserIds,
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
        mentions: message.mentions,
        isPinned: message.isPinned,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
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
   * Edit a message (author only)
   */
  editMessage: protectedProcedure
    .input(z.object({ messageId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const message = await ctx.db.roomMessage.findUnique({ where: { id: input.messageId } })
      if (!message) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" })
      if (message.userId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "Only the author can edit" })
      if (message.isDeleted) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit deleted message" })

      const mentionMatches = [...input.content.matchAll(/@(\w+)/g)]
      const mentionedUsernames = mentionMatches.map((m) => m[1]!).filter(Boolean)
      const mentionedUserIds: string[] = []
      if (mentionedUsernames.length > 0) {
        const users = await ctx.db.user.findMany({
          where: { username: { in: mentionedUsernames } },
          select: { id: true },
        })
        mentionedUserIds.push(...users.map((u) => u.id))
      }

      const updated = await ctx.db.roomMessage.update({
        where: { id: input.messageId },
        data: { content: input.content, editedAt: new Date(), mentions: mentionedUserIds },
      })

      return { id: updated.id, content: updated.content, editedAt: updated.editedAt }
    }),

  /**
   * Toggle reaction on a message (adds if absent, removes if present)
   */
  toggleReaction: protectedProcedure
    .input(z.object({ messageId: z.string(), emoji: z.string().max(10) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const message = await ctx.db.roomMessage.findUnique({ where: { id: input.messageId } })
      if (!message || message.isDeleted) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" })

      const reactions = (message.reactions as Record<string, string[]>) ?? {}
      const existing = reactions[input.emoji] ?? []

      if (existing.includes(userId)) {
        reactions[input.emoji] = existing.filter((id) => id !== userId)
        if (reactions[input.emoji]!.length === 0) delete reactions[input.emoji]
      } else {
        reactions[input.emoji] = [...existing, userId]
      }

      await ctx.db.roomMessage.update({ where: { id: input.messageId }, data: { reactions } })

      return { messageId: input.messageId, reactions }
    }),

  /**
   * Pin / unpin a message (owner or admin only)
   */
  pinMessage: protectedProcedure
    .input(z.object({ messageId: z.string(), pin: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const message = await ctx.db.roomMessage.findUnique({
        where: { id: input.messageId },
        include: { room: { include: { members: { where: { userId } } } } },
      })

      if (!message) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" })

      const myRole = message.room.members[0]?.role
      if (message.room.ownerId !== userId && myRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only owner/admin can pin messages" })
      }

      if (input.pin) {
        // Unpin any existing pinned message first (one pinned at a time)
        await ctx.db.roomMessage.updateMany({
          where: { roomId: message.roomId, isPinned: true },
          data: { isPinned: false },
        })
      }

      await ctx.db.roomMessage.update({ where: { id: input.messageId }, data: { isPinned: input.pin } })

      return { success: true, messageId: input.messageId, isPinned: input.pin }
    }),

  /**
   * Search messages in a room
   */
  searchMessages: protectedProcedure
    .input(z.object({ roomId: z.string(), query: z.string().min(1).max(100), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const membership = await ctx.db.roomMember.findUnique({
        where: { roomId_userId: { roomId: input.roomId, userId } },
      })
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })

      const messages = await ctx.db.roomMessage.findMany({
        where: {
          roomId: input.roomId,
          isDeleted: false,
          content: { contains: input.query, mode: "insensitive" },
        },
        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      })

      return messages.map((m) => ({
        id: m.id,
        userId: m.userId,
        userName: m.user.displayName ?? m.user.username,
        userAvatar: m.user.avatarUrl,
        content: m.content,
        createdAt: m.createdAt,
      }))
    }),

  /**
   * Get pinned message for a room
   */
  getPinnedMessage: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const message = await ctx.db.roomMessage.findFirst({
        where: { roomId: input.roomId, isPinned: true, isDeleted: false },
        include: { user: { select: { displayName: true, username: true } } },
      })
      if (!message) return null
      return {
        id: message.id,
        content: message.content,
        userName: message.user.displayName ?? message.user.username,
        createdAt: message.createdAt,
      }
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
   * Story 6.14: Mark room as read (updates lastReadAt)
   */
  markAsRead: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      await ctx.db.roomMember.update({
        where: { roomId_userId: { roomId: input.roomId, userId } },
        data: { lastReadAt: new Date() },
      })
      return { success: true }
    }),

  /**
   * Story 6.14: Get unread count for user's rooms
   */
  getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const memberships = await ctx.db.roomMember.findMany({
      where: { userId },
      select: { roomId: true, lastReadAt: true },
    })

    const counts = await Promise.all(
      memberships.map(async (m) => {
        const openTickets = await ctx.db.analyseTicket.count({
          where: { roomId: m.roomId, status: "OPEN" },
        })
        return { roomId: m.roomId, openTickets }
      })
    )

    return counts
  }),

  getChannelUnreadCounts: protectedProcedure
    .input(z.object({
      channels: z.array(z.object({
        channelId: z.string(),
        since: z.number(),
      }))
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const counts = await Promise.all(
        input.channels.map(async ({ channelId, since }) => {
          const count = await ctx.db.roomMessage.count({
            where: {
              channelId,
              isDeleted: false,
              userId: { not: userId },
              ...(since > 0 ? { createdAt: { gt: new Date(since) } } : {}),
            },
          })
          return { channelId, count }
        })
      )
      return counts
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

  /**
   * Get channels for a room (auto-creates if missing for legacy rooms)
   */
  getChannels: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        select: { visibility: true },
      })
      if (room?.visibility !== "PUBLIC") {
        const membership = await ctx.db.roomMember.findUnique({
          where: { roomId_userId: { roomId: input.roomId, userId } },
        })
        if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })
      }

      await createDefaultChannels(ctx.db, input.roomId)

      const channels = await ctx.db.roomChannel.findMany({
        where: { roomId: input.roomId },
        orderBy: { createdAt: "asc" },
        include: {
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
          tickets: {
            where: { status: "OPEN" },
            select: { id: true },
          },
        },
      })

      return channels.map(({ messages, tickets, ...ch }) => ({
        ...ch,
        latestMessageAt: messages[0]?.createdAt ?? null,
        openTicketCount: tickets.length,
      }))
    }),

  /**
   * Create a ticket in the Analyse channel
   */
  createTicket: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      channelId: z.string(),
      title: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const membership = await ctx.db.roomMember.findUnique({
        where: { roomId_userId: { roomId: input.roomId, userId } },
      })
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })

      const channel = await ctx.db.roomChannel.findUnique({ where: { id: input.channelId } })
      if (!channel || channel.type !== "ANALYSE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tickets only allowed in Analyse channel" })
      }

      return ctx.db.analyseTicket.create({
        data: {
          channelId: input.channelId,
          roomId: input.roomId,
          authorId: userId,
          title: input.title,
        },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { messages: true } },
        },
      })
    }),

  /**
   * Get tickets for an Analyse channel
   */
  getTickets: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      status: z.enum(["OPEN", "ARCHIVED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.analyseTicket.findMany({
        where: {
          channelId: input.channelId,
          status: input.status ?? undefined,
        },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      })
    }),

  /**
   * Invoke an AI agent in a room channel and save its response as a message
   */
  invokeAgentInRoom: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      channelId: z.string(),
      ticketId: z.string().optional(),
      agentId: z.string(),
      query: z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const membership = await ctx.db.roomMember.findUnique({
        where: { roomId_userId: { roomId: input.roomId, userId } },
      })
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              competition: true,
            },
          },
        },
      })

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { betanalyticApiKey: true },
      })

      let responseText: string
      try {
        const { agentOrchestrator } = await import("~/lib/agents/orchestrator")
        const result = await agentOrchestrator.routeQuery(input.agentId, input.query, {
          userId,
          userToken: user?.betanalyticApiKey ?? undefined,
          matchId: room?.matchId ?? undefined,
          homeTeam: room?.match?.homeTeam.name,
          awayTeam: room?.match?.awayTeam.name,
          competition: room?.match?.competition.name,
        })
        responseText = result.response
      } catch {
        responseText = "⚠️ Agent indisponible — réessaie dans quelques instants."
      }

      const message = await ctx.db.roomMessage.create({
        data: {
          roomId: input.roomId,
          channelId: input.channelId,
          ticketId: input.ticketId,
          userId,
          type: "AGENT",
          content: responseText,
          agentId: input.agentId,
          mentions: [],
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
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
        mentions: message.mentions,
        isPinned: message.isPinned,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
      }
    }),

  /**
   * Close (archive) a ticket — any member can close
   */
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const ticket = await ctx.db.analyseTicket.findUnique({
        where: { id: input.ticketId },
      })
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" })

      const membership = await ctx.db.roomMember.findUnique({
        where: { roomId_userId: { roomId: ticket.roomId, userId } },
      })
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" })

      if (ticket.status === "ARCHIVED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ticket already archived" })
      }

      return ctx.db.analyseTicket.update({
        where: { id: input.ticketId },
        data: { status: "ARCHIVED", closedAt: new Date() },
      })
    }),
})
