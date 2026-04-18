/**
 * Epic 11 Stories 11.1-11.2: Referral System
 * tRPC router for referral code generation, tracking, and rewards
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"

// Generate a unique 8-character referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excluding similar chars
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const referralRouter = createTRPCRouter({
  /**
   * Get or create user's referral code
   */
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Check if user already has a referral code
    let referral = await ctx.db.referral.findFirst({
      where: {
        referrerId: userId,
        referredUserId: null, // This is the user's own referral link
      },
    })

    // Create new referral code if doesn't exist
    if (!referral) {
      let attempts = 0
      let code = generateReferralCode()

      // Ensure uniqueness
      while (attempts < 10) {
        const existing = await ctx.db.referral.findUnique({
          where: { referralCode: code },
        })
        if (!existing) break
        code = generateReferralCode()
        attempts++
      }

      if (attempts >= 10) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate unique referral code",
        })
      }

      referral = await ctx.db.referral.create({
        data: {
          referralCode: code,
          referrerId: userId,
        },
      })
    }

    return {
      code: referral.referralCode,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}/ref/${referral.referralCode}`,
    }
  }),

  /**
   * Get referral statistics
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get all referrals made by this user
    const referrals = await ctx.db.referral.findMany({
      where: {
        referrerId: userId,
        NOT: {
          referredUserId: null, // Only count actual referrals, not the user's own code
        },
      },
      include: {
        referredUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
            subscriptionTier: true,
          },
        },
      },
      orderBy: {
        convertedAt: "desc",
      },
    })

    // Calculate stats
    const totalReferrals = referrals.length
    const activeReferrals = referrals.filter(r => r.status === "ACTIVE").length
    const churnedReferrals = referrals.filter(r => r.status === "CHURNED").length
    const pendingRewards = referrals.filter(r => !r.rewardGiven && r.status === "ACTIVE").length
    const totalRewardsEarned = referrals
      .filter(r => r.rewardGiven)
      .reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0)

    // Get share/click stats from user's main referral code
    const mainReferral = await ctx.db.referral.findFirst({
      where: {
        referrerId: userId,
        referredUserId: null,
      },
    })

    return {
      totalReferrals,
      activeReferrals,
      churnedReferrals,
      pendingRewards,
      totalRewardsEarned,
      shareCount: mainReferral?.shareCount ?? 0,
      clickCount: mainReferral?.clickCount ?? 0,
      referrals: referrals.map(r => ({
        id: r.id,
        username: r.referredUser?.username ?? "Unknown",
        displayName: r.referredUser?.displayName ?? r.referredUser?.username ?? "Unknown",
        status: r.status,
        convertedAt: r.convertedAt,
        firstPaymentAt: r.firstPaymentAt,
        rewardGiven: r.rewardGiven,
        rewardAmount: r.rewardAmount,
        subscriptionTier: r.referredUser?.subscriptionTier ?? "FREE",
      })),
    }
  }),

  /**
   * Increment share count
   */
  incrementShareCount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const referral = await ctx.db.referral.findFirst({
      where: {
        referrerId: userId,
        referredUserId: null,
      },
    })

    if (!referral) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Referral code not found",
      })
    }

    await ctx.db.referral.update({
      where: { id: referral.id },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    })

    return { success: true }
  }),

  /**
   * Track referral link click (Story 11.2)
   */
  trackReferralClick: publicProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const referral = await ctx.db.referral.findUnique({
        where: { referralCode: input.referralCode },
      })

      if (!referral) {
        return { success: false, error: "Invalid referral code" }
      }

      await ctx.db.referral.update({
        where: { id: referral.id },
        data: {
          clickCount: {
            increment: 1,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Process referral signup - called when new user signs up with referral code (Story 11.2)
   */
  processReferralSignup: publicProcedure
    .input(
      z.object({
        referralCode: z.string(),
        newUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the referral code
      const mainReferral = await ctx.db.referral.findUnique({
        where: { referralCode: input.referralCode },
      })

      if (!mainReferral) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid referral code",
        })
      }

      // Fraud detection: Check if user is referring themselves
      if (mainReferral.referrerId === input.newUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Self-referral is not allowed",
        })
      }

      // Check if user already used a referral code
      const existingUser = await ctx.db.user.findUnique({
        where: { id: input.newUserId },
        select: { referredByCode: true, welcomeBonusGiven: true },
      })

      if (existingUser?.referredByCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already used a referral code",
        })
      }

      // Create a new referral record linking the two users
      const newReferral = await ctx.db.referral.create({
        data: {
          referralCode: input.referralCode, // Same code for tracking
          referrerId: mainReferral.referrerId,
          referredUserId: input.newUserId,
          status: "ACTIVE",
          convertedAt: new Date(),
        },
      })

      // Give welcome bonus to new user (50 credits)
      await ctx.db.user.update({
        where: { id: input.newUserId },
        data: {
          referredByCode: input.referralCode,
          credits: { increment: 50 },
          lifetimeCredits: { increment: 50 },
          welcomeBonusGiven: true,
        },
      })

      return {
        success: true,
        referralId: newReferral.id,
        welcomeBonus: 50,
      }
    }),

  /**
   * Give referral reward to referrer when referred user makes first payment (Story 11.2)
   */
  giveReferralReward: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the referral where this user is the referred user
      const referral = await ctx.db.referral.findFirst({
        where: {
          referredUserId: input.userId,
          rewardGiven: false,
          status: "ACTIVE",
        },
        include: {
          referrer: true,
        },
      })

      if (!referral) {
        return { success: false, message: "No eligible referral found" }
      }

      // Give reward to referrer (100 credits)
      const rewardAmount = 100

      await ctx.db.user.update({
        where: { id: referral.referrerId },
        data: {
          credits: { increment: rewardAmount },
          lifetimeCredits: { increment: rewardAmount },
        },
      })

      // Mark reward as given
      await ctx.db.referral.update({
        where: { id: referral.id },
        data: {
          rewardGiven: true,
          rewardAmount,
          firstPaymentAt: new Date(),
        },
      })

      // TODO: Send notification to referrer "Parrainage récompensé!"

      return {
        success: true,
        rewardAmount,
        referrerId: referral.referrerId,
      }
    }),
})
