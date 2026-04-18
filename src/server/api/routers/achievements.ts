/**
 * Epic 11 Story 11.5: Achievements & Badges
 * tRPC router for achievements and badge system
 */

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

// Achievement categories
export type AchievementCategory = "PREDICTION" | "SOCIAL" | "LEARNING" | "MILESTONE"
export type AchievementRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY"

// Achievement definition
export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  requirement: number
  rarity: AchievementRarity
  points: number // Bonus points awarded on unlock
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // PREDICTION achievements
  {
    id: "first_prediction",
    name: "Premier Pronostic",
    description: "Faire votre premier pronostic",
    category: "PREDICTION",
    icon: "target",
    requirement: 1,
    rarity: "COMMON",
    points: 50,
  },
  {
    id: "10_predictions",
    name: "Pronostiqueur Actif",
    description: "Faire 10 pronostics",
    category: "PREDICTION",
    icon: "trending-up",
    requirement: 10,
    rarity: "COMMON",
    points: 100,
  },
  {
    id: "50_predictions",
    name: "Expert en Devenir",
    description: "Faire 50 pronostics",
    category: "PREDICTION",
    icon: "award",
    requirement: 50,
    rarity: "RARE",
    points: 300,
  },
  {
    id: "100_predictions",
    name: "Pronostiqueur Professionnel",
    description: "Faire 100 pronostics",
    category: "PREDICTION",
    icon: "trophy",
    requirement: 100,
    rarity: "EPIC",
    points: 500,
  },
  {
    id: "first_win",
    name: "Première Victoire",
    description: "Gagner votre premier pronostic",
    category: "PREDICTION",
    icon: "check-circle",
    requirement: 1,
    rarity: "COMMON",
    points: 75,
  },
  {
    id: "10_wins",
    name: "Série Gagnante",
    description: "Gagner 10 pronostics",
    category: "PREDICTION",
    icon: "flame",
    requirement: 10,
    rarity: "RARE",
    points: 250,
  },
  {
    id: "50_wins",
    name: "Maître des Pronostics",
    description: "Gagner 50 pronostics",
    category: "PREDICTION",
    icon: "crown",
    requirement: 50,
    rarity: "EPIC",
    points: 750,
  },
  {
    id: "win_streak_5",
    name: "Série de 5",
    description: "5 victoires consécutives",
    category: "PREDICTION",
    icon: "zap",
    requirement: 5,
    rarity: "RARE",
    points: 300,
  },
  {
    id: "win_streak_10",
    name: "Invincible",
    description: "10 victoires consécutives",
    category: "PREDICTION",
    icon: "shield",
    requirement: 10,
    rarity: "LEGENDARY",
    points: 1000,
  },

  // SOCIAL achievements
  {
    id: "first_referral",
    name: "Ambassadeur",
    description: "Parrainer votre premier ami",
    category: "SOCIAL",
    icon: "users",
    requirement: 1,
    rarity: "COMMON",
    points: 100,
  },
  {
    id: "5_referrals",
    name: "Recruteur",
    description: "Parrainer 5 amis",
    category: "SOCIAL",
    icon: "user-plus",
    requirement: 5,
    rarity: "RARE",
    points: 400,
  },
  {
    id: "10_referrals",
    name: "Influenceur",
    description: "Parrainer 10 amis",
    category: "SOCIAL",
    icon: "megaphone",
    requirement: 10,
    rarity: "EPIC",
    points: 800,
  },
  {
    id: "first_share",
    name: "Partageur",
    description: "Partager votre première analyse",
    category: "SOCIAL",
    icon: "share-2",
    requirement: 1,
    rarity: "COMMON",
    points: 50,
  },
  {
    id: "join_room",
    name: "Membre de la Communauté",
    description: "Rejoindre une salle collaborative",
    category: "SOCIAL",
    icon: "message-circle",
    requirement: 1,
    rarity: "COMMON",
    points: 50,
  },

  // LEARNING achievements
  {
    id: "first_agent_use",
    name: "Novice IA",
    description: "Utiliser un agent IA pour la première fois",
    category: "LEARNING",
    icon: "bot",
    requirement: 1,
    rarity: "COMMON",
    points: 50,
  },
  {
    id: "10_agent_uses",
    name: "Explorateur IA",
    description: "Utiliser les agents IA 10 fois",
    category: "LEARNING",
    icon: "brain",
    requirement: 10,
    rarity: "RARE",
    points: 200,
  },
  {
    id: "complete_tutorial",
    name: "Étudiant Appliqué",
    description: "Terminer le tutoriel complet",
    category: "LEARNING",
    icon: "book-open",
    requirement: 1,
    rarity: "COMMON",
    points: 100,
  },
  {
    id: "expert_mode",
    name: "Mode Expert",
    description: "Activer le mode expert",
    category: "LEARNING",
    icon: "graduation-cap",
    requirement: 1,
    rarity: "RARE",
    points: 200,
  },

  // MILESTONE achievements
  {
    id: "level_5",
    name: "Niveau 5",
    description: "Atteindre le niveau 5",
    category: "MILESTONE",
    icon: "star",
    requirement: 5,
    rarity: "COMMON",
    points: 100,
  },
  {
    id: "level_10",
    name: "Niveau 10",
    description: "Atteindre le niveau 10",
    category: "MILESTONE",
    icon: "star",
    requirement: 10,
    rarity: "RARE",
    points: 300,
  },
  {
    id: "level_25",
    name: "Niveau 25",
    description: "Atteindre le niveau 25",
    category: "MILESTONE",
    icon: "star",
    requirement: 25,
    rarity: "EPIC",
    points: 750,
  },
  {
    id: "level_50",
    name: "Niveau 50",
    description: "Atteindre le niveau 50",
    category: "MILESTONE",
    icon: "star",
    requirement: 50,
    rarity: "LEGENDARY",
    points: 2000,
  },
  {
    id: "1000_points",
    name: "Millier de Points",
    description: "Accumuler 1000 points",
    category: "MILESTONE",
    icon: "trophy",
    requirement: 1000,
    rarity: "RARE",
    points: 250,
  },
  {
    id: "10000_points",
    name: "Dix Mille Points",
    description: "Accumuler 10000 points",
    category: "MILESTONE",
    icon: "trophy",
    requirement: 10000,
    rarity: "EPIC",
    points: 1000,
  },
  {
    id: "7_day_streak",
    name: "Semaine Assidue",
    description: "7 jours de connexion consécutifs",
    category: "MILESTONE",
    icon: "calendar",
    requirement: 7,
    rarity: "RARE",
    points: 200,
  },
  {
    id: "30_day_streak",
    name: "Mois Fidèle",
    description: "30 jours de connexion consécutifs",
    category: "MILESTONE",
    icon: "calendar",
    requirement: 30,
    rarity: "LEGENDARY",
    points: 1500,
  },
]

export const achievementsRouter = createTRPCRouter({
  /**
   * Get all achievements with user progress
   */
  getAllAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get user's achievement progress
    const userAchievements = await ctx.db.userAchievement.findMany({
      where: { userId },
    })

    // Map achievements with user progress
    const achievementsWithProgress = ACHIEVEMENTS.map((achievement) => {
      const userProgress = userAchievements.find((ua) => ua.achievementId === achievement.id)
      return {
        ...achievement,
        progress: userProgress?.progress ?? 0,
        unlockedAt: userProgress?.unlockedAt ?? null,
        isUnlocked: !!userProgress?.unlockedAt,
      }
    })

    // Group by category
    const byCategory = {
      PREDICTION: achievementsWithProgress.filter((a) => a.category === "PREDICTION"),
      SOCIAL: achievementsWithProgress.filter((a) => a.category === "SOCIAL"),
      LEARNING: achievementsWithProgress.filter((a) => a.category === "LEARNING"),
      MILESTONE: achievementsWithProgress.filter((a) => a.category === "MILESTONE"),
    }

    // Calculate stats
    const totalAchievements = ACHIEVEMENTS.length
    const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length
    const totalPoints = achievementsWithProgress
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0)

    return {
      achievements: achievementsWithProgress,
      byCategory,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        totalPoints,
        completion: Math.round((unlockedCount / totalAchievements) * 100),
      },
    }
  }),

  /**
   * Track achievement progress (called by other systems)
   */
  trackProgress: protectedProcedure
    .input(
      z.object({
        achievementId: z.string(),
        increment: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const achievement = ACHIEVEMENTS.find((a) => a.id === input.achievementId)

      if (!achievement) {
        return { success: false, message: "Achievement not found" }
      }

      // Get or create user achievement
      let userAchievement = await ctx.db.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: input.achievementId,
          },
        },
      })

      if (!userAchievement) {
        userAchievement = await ctx.db.userAchievement.create({
          data: {
            userId,
            achievementId: input.achievementId,
            progress: 0,
          },
        })
      }

      // Don't increment if already unlocked
      if (userAchievement.unlockedAt) {
        return { success: true, alreadyUnlocked: true }
      }

      // Increment progress
      const newProgress = userAchievement.progress + input.increment
      const shouldUnlock = newProgress >= achievement.requirement

      await ctx.db.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          progress: newProgress,
          unlockedAt: shouldUnlock ? new Date() : undefined,
        },
      })

      // Award points if unlocked
      if (shouldUnlock) {
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            points: { increment: achievement.points },
            lifetimePoints: { increment: achievement.points },
          },
        })

        // Record points transaction
        await ctx.db.pointsTransaction.create({
          data: {
            userId,
            points: achievement.points,
            actionType: "LEVEL_UP", // Reusing for achievements
            description: `Badge débloqué: ${achievement.name}`,
            relatedEntityId: achievement.id,
          },
        })
      }

      return {
        success: true,
        unlocked: shouldUnlock,
        achievement: shouldUnlock ? achievement : undefined,
        progress: newProgress,
        requirement: achievement.requirement,
      }
    }),
})
