import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const AGENT_IDS = [
  "scout",
  "analyst",
  "predictor",
  "odds",
  "risk",
  "live",
  "history",
  "weather",
  "news",
  "social",
  "motivation",
  "lineup",
  "combo",
  "advisor",
] as const;

export const notificationsRouter = createTRPCRouter({
  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.notificationPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    // Return defaults if no preferences exist
    if (!prefs) {
      return {
        pushEnabled: true,
        emailDigest: "NONE" as const,
        inAppAlerts: true,
        dndEnabled: false,
        dndStart: "22:00",
        dndEnd: "08:00",
        matchAlerts: true,
        agentAlerts: true,
        weeklyDigest: false,
        agentNotifications: Object.fromEntries(
          AGENT_IDS.map((id) => [id, true])
        ) as Record<string, boolean>,
      };
    }

    return {
      pushEnabled: prefs.pushEnabled,
      emailDigest: prefs.emailDigest,
      inAppAlerts: prefs.inAppAlerts,
      dndEnabled: prefs.dndEnabled,
      dndStart: prefs.dndStart,
      dndEnd: prefs.dndEnd,
      matchAlerts: prefs.matchAlerts,
      agentAlerts: prefs.agentAlerts,
      weeklyDigest: prefs.weeklyDigest,
      agentNotifications: prefs.agentNotifications as Record<string, boolean>,
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        pushEnabled: z.boolean().optional(),
        emailDigest: z.enum(["NONE", "DAILY", "WEEKLY"]).optional(),
        inAppAlerts: z.boolean().optional(),
        dndEnabled: z.boolean().optional(),
        dndStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        dndEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        matchAlerts: z.boolean().optional(),
        agentAlerts: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        agentNotifications: z.record(z.string(), z.boolean()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prefs = await ctx.db.notificationPreferences.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          ...input,
        },
        update: input,
      });

      return { success: true, preferences: prefs };
    }),

  /**
   * Toggle a single agent notification
   */
  toggleAgentNotification: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prefs = await ctx.db.notificationPreferences.findUnique({
        where: { userId: ctx.session.user.id },
      });

      const currentAgentNotifications = (prefs?.agentNotifications ?? {}) as Record<
        string,
        boolean
      >;
      const updatedAgentNotifications = {
        ...currentAgentNotifications,
        [input.agentId]: input.enabled,
      };

      await ctx.db.notificationPreferences.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          agentNotifications: updatedAgentNotifications,
        },
        update: {
          agentNotifications: updatedAgentNotifications,
        },
      });

      return { success: true };
    }),

  /**
   * Check if notifications are currently allowed (DND check)
   */
  canSendNotification: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.notificationPreferences.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        pushEnabled: true,
        dndEnabled: true,
        dndStart: true,
        dndEnd: true,
      },
    });

    if (!prefs) {
      return { canSend: true, reason: null };
    }

    if (!prefs.pushEnabled) {
      return { canSend: false, reason: "push_disabled" };
    }

    if (prefs.dndEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const startTime = prefs.dndStart;
      const endTime = prefs.dndEnd;

      // Check if current time is in DND window
      // Handle overnight DND (e.g., 22:00 - 08:00)
      const isInDndWindow =
        startTime > endTime
          ? currentTime >= startTime || currentTime < endTime // Overnight
          : currentTime >= startTime && currentTime < endTime; // Same day

      if (isInDndWindow) {
        return { canSend: false, reason: "dnd_active" };
      }
    }

    return { canSend: true, reason: null };
  }),
});
