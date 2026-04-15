import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Maximum concurrent sessions per user
const MAX_SESSIONS = 3;

export const sessionRouter = createTRPCRouter({
  /**
   * Get all active sessions for current user
   */
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.db.session.findMany({
      where: {
        userId: ctx.session.user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        deviceName: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    // Get current session token from the JWT
    const currentSessionId = ctx.session.sessionId;

    return sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
      deviceInfo: parseUserAgent(session.userAgent),
    }));
  }),

  /**
   * Revoke a specific session
   */
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input;

      // Find the session
      const session = await ctx.db.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session non trouvée",
        });
      }

      // Verify ownership
      if (session.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Non autorisé",
        });
      }

      // Check if trying to revoke current session
      if (session.id === ctx.session.sessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Utilisez la déconnexion pour terminer la session actuelle",
        });
      }

      // Delete the session
      await ctx.db.session.delete({
        where: { id: sessionId },
      });

      // TODO: Send notification to revoked device
      // In production: use push notifications or email

      return { success: true };
    }),

  /**
   * Revoke all sessions except current
   */
  revokeAllOtherSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const currentSessionId = ctx.session.sessionId;

    const result = await ctx.db.session.deleteMany({
      where: {
        userId: ctx.session.user.id,
        id: { not: currentSessionId },
      },
    });

    return {
      success: true,
      revokedCount: result.count,
    };
  }),

  /**
   * Get session count for login validation
   */
  getSessionCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.session.count({
      where: {
        userId: ctx.session.user.id,
        expiresAt: { gt: new Date() },
      },
    });

    return {
      count,
      limit: MAX_SESSIONS,
      canCreateNew: count < MAX_SESSIONS,
    };
  }),

  /**
   * Update last activity for current session
   */
  updateActivity: protectedProcedure.mutation(async ({ ctx }) => {
    const currentSessionId = ctx.session.sessionId;

    if (!currentSessionId) {
      return { success: false };
    }

    await ctx.db.session.update({
      where: { id: currentSessionId },
      data: { lastActiveAt: new Date() },
    });

    return { success: true };
  }),
});

/**
 * Parse user agent string to get device info
 */
function parseUserAgent(userAgent: string | null): {
  browser: string;
  os: string;
  device: string;
} {
  if (!userAgent) {
    return { browser: "Inconnu", os: "Inconnu", device: "Inconnu" };
  }

  // Simple UA parsing - in production use a library like ua-parser-js
  let browser = "Inconnu";
  let os = "Inconnu";
  let device = "Desktop";

  // Browser detection
  if (userAgent.includes("Chrome")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari")) {
    browser = "Safari";
  } else if (userAgent.includes("Edge")) {
    browser = "Edge";
  }

  // OS detection
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    device = "Mobile";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
    device = userAgent.includes("iPad") ? "Tablet" : "Mobile";
  }

  return { browser, os, device };
}
