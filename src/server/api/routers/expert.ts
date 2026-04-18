/**
 * Epic 10: Expert Program tRPC Router
 * Handles expert applications, verification, and management
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"

export const expertRouter = createTRPCRouter({
  /**
   * Story 10.1: Submit Expert Application
   */
  submitApplication: protectedProcedure
    .input(
      z.object({
        bio: z.string().min(50).max(500),
        expertiseAreas: z.array(z.string()).min(1),
        socialProofLinks: z.array(z.string().url()).min(1),
        trackRecord: z.string().min(100).max(1000),
        certifications: z.string().optional(),
        mediaAppearances: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user has Premium or Expert tier
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
      })

      if (!user || (user.subscriptionTier !== "PREMIUM" && user.subscriptionTier !== "EXPERT")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Premium subscription required to apply for Expert status",
        })
      }

      // Check if user already has a pending or approved application
      const existingApplication = await ctx.db.expertApplication.findUnique({
        where: { userId },
      })

      if (existingApplication) {
        if (existingApplication.status === "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You already have a pending application",
          })
        }
        if (existingApplication.status === "APPROVED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You are already a verified expert",
          })
        }
        // If rejected, allow reapplication after 30 days
        if (existingApplication.status === "REJECTED") {
          const daysSinceRejection = Math.floor(
            (Date.now() - existingApplication.reviewedAt!.getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceRejection < 30) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `You can reapply ${30 - daysSinceRejection} days after rejection`,
            })
          }
        }
      }

      // Create or update application
      const application = await ctx.db.expertApplication.upsert({
        where: { userId },
        create: {
          userId,
          bio: input.bio,
          expertiseAreas: input.expertiseAreas,
          socialProofLinks: input.socialProofLinks,
          trackRecord: input.trackRecord,
          certifications: input.certifications,
          mediaAppearances: input.mediaAppearances,
          status: "PENDING",
        },
        update: {
          bio: input.bio,
          expertiseAreas: input.expertiseAreas,
          socialProofLinks: input.socialProofLinks,
          trackRecord: input.trackRecord,
          certifications: input.certifications,
          mediaAppearances: input.mediaAppearances,
          status: "PENDING",
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: null,
        },
      })

      // TODO: Send notification to admins about new application

      return application
    }),

  /**
   * Get current user's application status
   */
  getMyApplication: protectedProcedure.query(async ({ ctx }) => {
    const application = await ctx.db.expertApplication.findUnique({
      where: { userId: ctx.session.user.id },
    })

    return application
  }),

  /**
   * Check if user is a verified expert
   */
  isExpert: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.expertProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { isActive: true },
    })

    return profile?.isActive ?? false
  }),

  /**
   * Get expert profile
   */
  getMyExpertProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.expertProfile.findUnique({
      where: { userId: ctx.session.user.id },
    })

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expert profile not found",
      })
    }

    return profile
  }),

  /**
   * Story 10.3: Get expert profile by user ID
   */
  getExpertProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.expertProfile.findUnique({
        where: { userId: input.userId },
      })

      return profile
    }),

  /**
   * Story 10.5: Create premium content
   */
  createContent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        content: z.string().min(50),
        excerpt: z.string().max(200).optional(),
        coverImage: z.string().url().optional(),
        isPremium: z.boolean(),
        category: z.string().optional(),
        tags: z.array(z.string()),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is an expert
      const expertProfile = await ctx.db.expertProfile.findUnique({
        where: { userId: ctx.session.user.id },
      })

      if (!expertProfile?.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a verified expert to create content",
        })
      }

      // Create content
      const content = await ctx.db.expertContent.create({
        data: {
          authorId: ctx.session.user.id,
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          coverImage: input.coverImage,
          isPremium: input.isPremium,
          category: input.category,
          tags: input.tags,
          isPublished: input.isPublished,
          isDraft: !input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
        },
      })

      // Update expert content count if published
      if (input.isPublished) {
        await ctx.db.expertProfile.update({
          where: { userId: ctx.session.user.id },
          data: {
            contentCount: {
              increment: 1,
            },
          },
        })
      }

      return content
    }),

  /**
   * Story 10.5: Get expert content list
   */
  getMyContent: protectedProcedure.query(async ({ ctx }) => {
    const content = await ctx.db.expertContent.findMany({
      where: { authorId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return content
  }),

  /**
   * Story 10.6: Follow an expert
   */
  followExpert: protectedProcedure
    .input(z.object({ expertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify target is an expert
      const expertProfile = await ctx.db.expertProfile.findUnique({
        where: { userId: input.expertId },
      })

      if (!expertProfile?.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not a verified expert",
        })
      }

      // Create follow
      const follow = await ctx.db.expertFollow.create({
        data: {
          userId: ctx.session.user.id,
          expertId: input.expertId,
        },
      })

      // Update follower count
      await ctx.db.expertProfile.update({
        where: { userId: input.expertId },
        data: {
          followerCount: {
            increment: 1,
          },
        },
      })

      return follow
    }),

  /**
   * Story 10.6: Unfollow an expert
   */
  unfollowExpert: protectedProcedure
    .input(z.object({ expertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.expertFollow.delete({
        where: {
          userId_expertId: {
            userId: ctx.session.user.id,
            expertId: input.expertId,
          },
        },
      })

      // Update follower count
      await ctx.db.expertProfile.update({
        where: { userId: input.expertId },
        data: {
          followerCount: {
            decrement: 1,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Story 10.6: Check if following expert
   */
  isFollowing: protectedProcedure
    .input(z.object({ expertId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await ctx.db.expertFollow.findUnique({
        where: {
          userId_expertId: {
            userId: ctx.session.user.id,
            expertId: input.expertId,
          },
        },
      })

      return !!follow
    }),

  /**
   * Story 10.6: Subscribe to expert (mock - real Stripe in Story 10.7)
   */
  subscribeToExpert: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        plan: z.enum(["MONTHLY", "YEARLY"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify expert exists and accepts subscriptions
      const expertProfile = await ctx.db.expertProfile.findUnique({
        where: { userId: input.expertId },
      })

      if (!expertProfile?.isActive || !expertProfile.isAcceptingSubs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expert is not accepting subscriptions",
        })
      }

      const price =
        input.plan === "MONTHLY"
          ? expertProfile.monthlyPrice ?? 0
          : expertProfile.yearlyPrice ?? 0

      if (!price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expert has not set pricing for this plan",
        })
      }

      // Check for existing subscription
      const existing = await ctx.db.expertSubscription.findUnique({
        where: {
          userId_expertId: {
            userId: ctx.session.user.id,
            expertId: input.expertId,
          },
        },
      })

      if (existing && existing.status === "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active subscription to this expert",
        })
      }

      // Calculate period end
      const currentPeriodEnd = new Date()
      if (input.plan === "MONTHLY") {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
      }

      // Create subscription (mock - without Stripe for now)
      const subscription = await ctx.db.expertSubscription.create({
        data: {
          userId: ctx.session.user.id,
          expertId: input.expertId,
          plan: input.plan,
          price,
          currentPeriodEnd,
          status: "ACTIVE",
        },
      })

      // Update subscriber count
      await ctx.db.expertProfile.update({
        where: { userId: input.expertId },
        data: {
          subscriberCount: {
            increment: 1,
          },
        },
      })

      return subscription
    }),

  /**
   * Story 10.6: Check subscription status
   */
  getSubscriptionStatus: protectedProcedure
    .input(z.object({ expertId: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.db.expertSubscription.findUnique({
        where: {
          userId_expertId: {
            userId: ctx.session.user.id,
            expertId: input.expertId,
          },
        },
      })

      return subscription
    }),

  /**
   * Story 10.7: Request payout
   */
  requestPayout: protectedProcedure
    .input(z.object({ amount: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const expertProfile = await ctx.db.expertProfile.findUnique({
        where: { userId: ctx.session.user.id },
      })

      if (!expertProfile?.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a verified expert to request payouts",
        })
      }

      if (input.amount > expertProfile.pendingPayout) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient pending payout balance",
        })
      }

      if (input.amount < expertProfile.payoutThreshold) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum payout amount is €${expertProfile.payoutThreshold}`,
        })
      }

      const payoutRequest = await ctx.db.payoutRequest.create({
        data: {
          expertId: ctx.session.user.id,
          amount: input.amount,
          status: "PENDING",
        },
      })

      await ctx.db.expertProfile.update({
        where: { userId: ctx.session.user.id },
        data: {
          pendingPayout: {
            decrement: input.amount,
          },
        },
      })

      return payoutRequest
    }),

  /**
   * Story 10.7: Get payout requests
   */
  getMyPayoutRequests: protectedProcedure.query(async ({ ctx }) => {
    const payoutRequests = await ctx.db.payoutRequest.findMany({
      where: { expertId: ctx.session.user.id },
      orderBy: { requestedAt: "desc" },
    })

    return payoutRequests
  }),

  /**
   * Story 10.7: Get revenue analytics
   */
  getRevenueAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const expertProfile = await ctx.db.expertProfile.findUnique({
      where: { userId: ctx.session.user.id },
    })

    if (!expertProfile?.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a verified expert",
      })
    }

    const activeSubscriptions = await ctx.db.expertSubscription.findMany({
      where: {
        expertId: ctx.session.user.id,
        status: "ACTIVE",
      },
    })

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthlyAmount = sub.plan === "MONTHLY" ? sub.price : sub.price / 12
      return sum + monthlyAmount
    }, 0)

    const platformFee = 0.2
    const expertCut = mrr * (1 - platformFee)

    return {
      totalRevenue: expertProfile.totalRevenue,
      expertRevenue: expertProfile.expertRevenue,
      platformRevenue: expertProfile.platformRevenue,
      pendingPayout: expertProfile.pendingPayout,
      totalPaidOut: expertProfile.totalPaidOut,
      monthlyRecurringRevenue: mrr,
      expertMonthlyRevenue: expertCut,
      activeSubscriptions: activeSubscriptions.length,
      payoutThreshold: expertProfile.payoutThreshold,
    }
  }),

  /**
   * Story 10.7: Update pricing
   */
  updatePricing: protectedProcedure
    .input(
      z.object({
        monthlyPrice: z.number().min(0).optional(),
        yearlyPrice: z.number().min(0).optional(),
        isAcceptingSubs: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const expertProfile = await ctx.db.expertProfile.findUnique({
        where: { userId: ctx.session.user.id },
      })

      if (!expertProfile?.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a verified expert",
        })
      }

      await ctx.db.expertProfile.update({
        where: { userId: ctx.session.user.id },
        data: {
          monthlyPrice: input.monthlyPrice,
          yearlyPrice: input.yearlyPrice,
          isAcceptingSubs: input.isAcceptingSubs,
        },
      })

      return { success: true }
    }),

  /**
   * Story 10.2: Admin procedures for expert verification
   */
  admin: createTRPCRouter({
    /**
     * List all expert applications (admin only)
     */
    listApplications: protectedProcedure
      .input(
        z
          .object({
            status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // TODO: Add admin role check
        // For now, assume user is admin

        const applications = await ctx.db.expertApplication.findMany({
          where: input?.status ? { status: input.status } : undefined,
          include: {
            user: {
              select: {
                username: true,
                email: true,
                displayName: true,
                subscriptionTier: true,
                createdAt: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        })

        return applications
      }),

    /**
     * Approve expert application (admin only)
     */
    approveApplication: protectedProcedure
      .input(
        z.object({
          applicationId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Add admin role check
        const adminId = ctx.session.user.id

        const application = await ctx.db.expertApplication.findUnique({
          where: { id: input.applicationId },
        })

        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found",
          })
        }

        if (application.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Application already reviewed",
          })
        }

        // Update application status
        await ctx.db.expertApplication.update({
          where: { id: input.applicationId },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: adminId,
          },
        })

        // Create expert profile
        await ctx.db.expertProfile.create({
          data: {
            userId: application.userId,
            verifiedBy: adminId,
            expertiseAreas: application.expertiseAreas,
            isActive: true,
          },
        })

        // Update user subscription tier to EXPERT
        await ctx.db.user.update({
          where: { id: application.userId },
          data: { subscriptionTier: "EXPERT" },
        })

        // TODO: Send notification to user: "Félicitations! Vous êtes Expert Vérifié"

        return { success: true }
      }),

    /**
     * Reject expert application (admin only)
     */
    rejectApplication: protectedProcedure
      .input(
        z.object({
          applicationId: z.string(),
          reason: z.string().min(10),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Add admin role check
        const adminId = ctx.session.user.id

        const application = await ctx.db.expertApplication.findUnique({
          where: { id: input.applicationId },
        })

        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found",
          })
        }

        if (application.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Application already reviewed",
          })
        }

        // Update application status
        await ctx.db.expertApplication.update({
          where: { id: input.applicationId },
          data: {
            status: "REJECTED",
            reviewedAt: new Date(),
            reviewedBy: adminId,
            rejectionReason: input.reason,
          },
        })

        // TODO: Send notification to user with rejection reason

        return { success: true }
      }),
  }),
})
