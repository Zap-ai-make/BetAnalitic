import { z } from "zod";
import { observable } from "@trpc/server/observable";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { agentRegistry } from "~/lib/agents";

const agentTypeEnum = z.enum([
  "SCOUT", "FORM", "H2H", "STATS", "MOMENTUM", "CONTEXT",
  "ODDS", "WEATHER", "REFEREE", "INJURY", "SENTIMENT",
  "PREDICTION", "RISK", "VALUE"
]);

export const agentsRouter = createTRPCRouter({
  /**
   * Get all agents
   */
  getAll: protectedProcedure.query(() => {
    return agentRegistry.getAll();
  }),

  /**
   * Get agent by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const agent = agentRegistry.getById(input.id);
      if (!agent) {
        throw new Error(`Agent ${input.id} not found`);
      }
      return agent;
    }),

  /**
   * Get agents by category
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        category: z.enum(["Data", "Analyse", "Marché", "Intel", "Live"]),
      })
    )
    .query(({ input }) => {
      return agentRegistry.getByCategory(input.category);
    }),

  /**
   * Get enabled agents only
   */
  getEnabled: protectedProcedure.query(() => {
    return agentRegistry.getEnabled();
  }),

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  /**
   * Create new conversation
   */
  createConversation: protectedProcedure
    .input(z.object({
      agentType: agentTypeEnum,
      matchId: z.string().optional(),
      roomId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.agentConversation.create({
        data: {
          userId: ctx.session.user.id,
          agentType: input.agentType,
          matchId: input.matchId,
          roomId: input.roomId,
        },
      });
    }),

  /**
   * Get conversation by ID
   */
  getConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.agentConversation.findUnique({
        where: { id: input.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: { feedback: true },
          },
        },
      });
    }),

  /**
   * List user conversations
   */
  listConversations: protectedProcedure
    .input(z.object({
      agentType: agentTypeEnum.optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conversations = await ctx.db.agentConversation.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.agentType && { agentType: input.agentType }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (conversations.length > input.limit) {
        const nextItem = conversations.pop();
        nextCursor = nextItem?.id;
      }

      return { conversations, nextCursor };
    }),

  /**
   * Delete conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const conversation = await ctx.db.agentConversation.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!conversation || conversation.userId !== ctx.session.user.id) {
        throw new Error("Conversation not found or unauthorized");
      }

      return ctx.db.agentConversation.delete({
        where: { id: input.id },
      });
    }),

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================

  /**
   * Send message (invoke agent) - Returns immediately
   */
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create user message
      const userMessage = await ctx.db.agentMessage.create({
        data: {
          conversationId: input.conversationId,
          userId: ctx.session.user.id,
          role: "USER",
          content: input.content,
        },
      });

      // Update conversation timestamp
      await ctx.db.agentConversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return { userMessage };
    }),

  /**
   * Stream agent response (SSE)
   */
  streamResponse: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      messageId: z.string(), // User message ID
    }))
    .subscription(async ({ ctx, input }) => {
      return observable<{ content: string; done: boolean }>((emit) => {
        // TODO: Call VPS API and stream response
        // For now, mock streaming
        let i = 0;
        const mockResponse = "Ceci est une réponse simulée de l'agent. Le vrai streaming viendra du VPS backend via SSE.";
        const words = mockResponse.split(" ");

        const interval = setInterval(() => {
          if (i < words.length) {
            emit.next({
              content: words.slice(0, i + 1).join(" "),
              done: false,
            });
            i++;
          } else {
            // Save final message to DB
            void ctx.db.agentMessage.create({
              data: {
                conversationId: input.conversationId,
                userId: ctx.session.user.id,
                role: "AGENT",
                content: mockResponse,
                metadata: { mock: true },
              },
            }).then(() => {
              emit.next({ content: mockResponse, done: true });
              emit.complete();
            });
            clearInterval(interval);
          }
        }, 100);

        return () => {
          clearInterval(interval);
        };
      });
    }),

  // ============================================
  // FEEDBACK
  // ============================================

  /**
   * Submit feedback on agent response
   */
  submitFeedback: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      rating: z.enum(["THUMBS_UP", "THUMBS_DOWN"]),
      comment: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.agentFeedback.upsert({
        where: { messageId: input.messageId },
        create: {
          messageId: input.messageId,
          userId: ctx.session.user.id,
          rating: input.rating,
          comment: input.comment,
        },
        update: {
          rating: input.rating,
          comment: input.comment,
        },
      });
    }),

  // ============================================
  // GUEST MODE (PUBLIC)
  // ============================================

  /**
   * Preview agent (guest mode - no auth required)
   */
  previewAgent: publicProcedure
    .input(z.object({
      agentType: agentTypeEnum,
      query: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      // TODO: Call VPS API with rate limiting for guests
      return {
        content: `Preview response from ${input.agentType} for: "${input.query}"`,
        isPreview: true,
        limited: true,
      };
    }),
});
