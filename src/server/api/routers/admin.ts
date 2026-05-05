/**
 * Admin Router (Epic 14)
 * Provides admin-only procedures for platform moderation and management
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure, moderatorProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole, ContentReportType, ReportStatus, type Prisma } from "@prisma/client";

// ============================================
// Router
// ============================================

export const adminRouter = createTRPCRouter({
  // ============================================
  // Story 14.1: Admin Dashboard & Overview
  // ============================================

  /**
   * Get platform metrics for admin dashboard
   */
  getMetrics: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = new Date();

      // Calculate start date based on time range
      switch (input.timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Get active users (last 24h, 7d, 30d)
      const now24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const now7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const now30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        activeUsers24h,
        activeUsers7d,
        activeUsers30d,
        newRegistrations,
        pendingReports,
        pendingExpertApplications,
        totalUsers,
        premiumUsers,
      ] = await Promise.all([
        ctx.db.user.count({
          where: { lastLoginAt: { gte: now24h } },
        }),
        ctx.db.user.count({
          where: { lastLoginAt: { gte: now7d } },
        }),
        ctx.db.user.count({
          where: { lastLoginAt: { gte: now30d } },
        }),
        ctx.db.user.count({
          where: { createdAt: { gte: startDate } },
        }),
        ctx.db.contentReport.count({
          where: { status: "PENDING" },
        }),
        ctx.db.expertApplication.count({
          where: { status: "PENDING" },
        }),
        ctx.db.user.count(),
        ctx.db.user.count({
          where: {
            subscriptionTier: { in: ["PREMIUM", "EXPERT"] },
          },
        }),
      ]);

      // Get registration trend (daily counts for the period)
      const registrationTrend = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      });

      // Calculate revenue (mock for now - will be from subscription records later)
      const revenue = premiumUsers * 9.99; // Simplified calculation

      return {
        activeUsers: {
          daily: activeUsers24h,
          weekly: activeUsers7d,
          monthly: activeUsers30d,
        },
        newRegistrations,
        revenue: {
          total: revenue,
          currency: "EUR",
        },
        moderation: {
          pendingReports,
          pendingExpertApplications,
        },
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: totalUsers - premiumUsers,
        },
        registrationTrend: registrationTrend.map((day) => ({
          date: day.createdAt,
          count: day._count,
        })),
      };
    }),

  /**
   * Get system health indicators
   */
  getSystemHealth: adminProcedure.query(async ({ ctx }) => {
    // Check database connectivity
    const dbHealthy = await ctx.db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

    // Get recent error count (from audit logs with error actions)
    const recentErrors = await ctx.db.auditLog.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
        action: { contains: "ERROR" },
      },
    });

    return {
      database: dbHealthy ? "healthy" : "unhealthy",
      errors: {
        lastHour: recentErrors,
        status: recentErrors > 100 ? "critical" : recentErrors > 10 ? "warning" : "healthy",
      },
      uptime: process.uptime(),
    };
  }),

  // ============================================
  // Story 14.2: User Management
  // ============================================

  /**
   * Search and list users
   */
  searchUsers: adminProcedure
    .input(
      z.object({
        query: z.string().optional(),
        role: z.nativeEnum(UserRole).optional(),
        subscriptionTier: z.enum(["FREE", "PREMIUM", "EXPERT"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: {
        OR?: Array<{
          email?: { contains: string; mode: "insensitive" };
          username?: { contains: string; mode: "insensitive" };
          displayName?: { contains: string; mode: "insensitive" };
        }>;
        role?: typeof input.role;
        subscriptionTier?: typeof input.subscriptionTier;
      } = {};

      if (input.query) {
        where.OR = [
          { email: { contains: input.query, mode: "insensitive" } },
          { username: { contains: input.query, mode: "insensitive" } },
          { displayName: { contains: input.query, mode: "insensitive" } },
        ];
      }

      if (input.role) {
        where.role = input.role;
      }

      if (input.subscriptionTier) {
        where.subscriptionTier = input.subscriptionTier;
      }

      const users = await ctx.db.user.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          subscriptionTier: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          emailVerified: true,
        },
      });

      let nextCursor: string | undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem?.id;
      }

      return {
        users,
        nextCursor,
      };
    }),

  /**
   * Get detailed user profile for admin
   */
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          sessions: {
            orderBy: { lastActiveAt: "desc" },
            take: 10,
          },
          sanctions: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
          },
          contentReports: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          reportedIn: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  /**
   * Update user (reset password, change plan, add credits)
   */
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(UserRole).optional(),
        subscriptionTier: z.enum(["FREE", "PREMIUM", "EXPERT"]).optional(),
        credits: z.number().optional(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, reason, ...updates } = input;

      // Update user
      const user = await ctx.db.user.update({
        where: { id: userId },
        data: updates,
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          action: "USER_UPDATED",
          actorId: ctx.session.user.id,
          targetType: "user",
          targetId: userId,
          details: {
            reason,
            changes: updates,
          },
        },
      });

      return user;
    }),

  /**
   * Force logout all user sessions
   */
  forceLogoutUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Delete all sessions
      await ctx.db.session.deleteMany({
        where: { userId: input.userId },
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          action: "USER_FORCE_LOGOUT",
          actorId: ctx.session.user.id,
          targetType: "user",
          targetId: input.userId,
          details: {
            reason: input.reason,
          },
        },
      });

      return { success: true };
    }),

  // ============================================
  // Story 14.3-14.4: Content Moderation & Reports
  // ============================================

  /**
   * Get moderation queue (reports to review)
   */
  getModerationQueue: moderatorProcedure
    .input(
      z.object({
        status: z.nativeEnum(ReportStatus).optional(),
        type: z.nativeEnum(ContentReportType).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: {
        status?: ReportStatus;
        reportedType?: ContentReportType;
      } = {};
      if (input.status) where.status = input.status;
      if (input.type) where.reportedType = input.type;

      const reports = await ctx.db.contentReport.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { status: "asc" }, // Pending first
          { createdAt: "desc" },
        ],
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (reports.length > input.limit) {
        const nextItem = reports.pop();
        nextCursor = nextItem?.id;
      }

      return { reports, nextCursor };
    }),

  /**
   * Review a report
   */
  reviewReport: moderatorProcedure
    .input(
      z.object({
        reportId: z.string(),
        action: z.enum(["APPROVED", "REMOVED", "USER_WARNED", "DISMISSED"]),
        resolution: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.contentReport.update({
        where: { id: input.reportId },
        data: {
          status: input.action === "DISMISSED" ? "DISMISSED" : "RESOLVED",
          reviewedAt: new Date(),
          reviewedBy: ctx.session.user.id,
          resolution: input.resolution,
          actionTaken: input.action,
        },
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          action: "REPORT_REVIEWED",
          actorId: ctx.session.user.id,
          targetType: "report",
          targetId: input.reportId,
          details: {
            action: input.action,
            resolution: input.resolution,
          },
        },
      });

      return report;
    }),

  // ============================================
  // Story 14.9: Audit Logs
  // ============================================

  /**
   * Get audit logs
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        action: z.string().optional(),
        actorId: z.string().optional(),
        targetType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: {
        action?: { contains: string };
        actorId?: string;
        targetType?: string;
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};

      if (input.action) where.action = { contains: input.action };
      if (input.actorId) where.actorId = input.actorId;
      if (input.targetType) where.targetType = input.targetType;
      if (input.startDate ?? input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const logs = await ctx.db.auditLog.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              role: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }

      return { logs, nextCursor };
    }),

  // ============================================
  // Story 14.10: Ban & Suspension System
  // ============================================

  /**
   * Apply sanction to user
   */
  applySanction: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(["WARNING", "MUTE", "SUSPENSION", "BAN"]),
        reason: z.string().min(1),
        duration: z.number().optional(), // hours
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const expiresAt = input.duration
        ? new Date(Date.now() + input.duration * 60 * 60 * 1000)
        : input.type === "BAN"
          ? null
          : undefined;

      const sanction = await ctx.db.userSanction.create({
        data: {
          userId: input.userId,
          type: input.type,
          reason: input.reason,
          duration: input.duration,
          expiresAt,
          appliedBy: ctx.session.user.id,
        },
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          action: `USER_${input.type}`,
          actorId: ctx.session.user.id,
          targetType: "user",
          targetId: input.userId,
          details: {
            sanctionId: sanction.id,
            reason: input.reason,
            duration: input.duration,
            expiresAt,
          },
        },
      });

      return sanction;
    }),

  /**
   * Remove sanction
   */
  removeSanction: adminProcedure
    .input(
      z.object({
        sanctionId: z.string(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sanction = await ctx.db.userSanction.update({
        where: { id: input.sanctionId },
        data: { isActive: false },
      });

      await ctx.db.auditLog.create({
        data: {
          action: "SANCTION_REMOVED",
          actorId: ctx.session.user.id,
          targetType: "user",
          targetId: sanction.userId,
          details: {
            sanctionId: input.sanctionId,
            reason: input.reason,
          },
        },
      });

      return sanction;
    }),

  // ============================================
  // Story 14.11: Platform Announcements
  // ============================================

  /**
   * Create announcement
   */
  createAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["INFO", "WARNING", "CRITICAL", "MAINTENANCE"]),
        targetAudience: z.record(z.unknown()).default({ all: true }), // JSON object
        displayAs: z.enum(["BANNER", "MODAL", "NOTIFICATION"]).default("BANNER"),
        dismissible: z.boolean().default(true),
        publishAt: z.date().optional(),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.db.platformAnnouncement.create({
        data: {
          title: input.title,
          content: input.content,
          type: input.type,
          targetAudience: input.targetAudience as Prisma.InputJsonValue,
          displayAs: input.displayAs,
          dismissible: input.dismissible,
          publishAt: input.publishAt,
          expiresAt: input.expiresAt,
          createdBy: ctx.session.user.id,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          action: "ANNOUNCEMENT_CREATED",
          actorId: ctx.session.user.id,
          targetType: "announcement",
          targetId: announcement.id,
          details: {
            title: input.title,
            type: input.type,
          },
        },
      });

      return announcement;
    }),

  /**
   * Get active announcements for user
   */
  getAnnouncements: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const announcements = await ctx.db.platformAnnouncement.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { publishAt: null },
              { publishAt: { lte: now } },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        reads: {
          where: { userId: ctx.session.user.id },
        },
      },
    });

    // Filter based on targetAudience
    return announcements.filter((a) => {
      const target = a.targetAudience as {
        all?: boolean;
        tiers?: string[];
        userIds?: string[];
      };
      if (target.all) return true;
      if (target.tiers?.includes(ctx.session.user.subscriptionTier)) return true;
      if (target.userIds?.includes(ctx.session.user.id)) return true;
      return false;
    });
  }),

  /**
   * Mark announcement as read
   */
  markAnnouncementRead: protectedProcedure
    .input(z.object({ announcementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcementRead.create({
        data: {
          userId: ctx.session.user.id,
          announcementId: input.announcementId,
        },
      });
    }),

  // ============================================
  // Story 14.12: Analytics & Reporting
  // ============================================

  /**
   * Get detailed analytics
   */
  getAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        metrics: z.array(z.enum(["users", "revenue", "engagement", "content"])).default(["users"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      const analytics: {
        users?: {
          total: number;
          new: number;
          active: number;
          retention: number;
        };
        engagement?: {
          roomMessages: number;
          agentInvocations: number;
        };
      } = {};

      if (input.metrics.includes("users")) {
        const [totalUsers, newUsers, activeUsers] = await Promise.all([
          ctx.db.user.count(),
          ctx.db.user.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
          }),
          ctx.db.user.count({
            where: { lastLoginAt: { gte: startDate, lte: endDate } },
          }),
        ]);

        analytics.users = {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          retention: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        };
      }

      if (input.metrics.includes("engagement")) {
        const roomMessages = await ctx.db.roomMessage.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        });

        const agentMessages = await ctx.db.agentMessage.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        });

        analytics.engagement = {
          roomMessages,
          agentInvocations: agentMessages,
        };
      }

      return analytics;
    }),
});
