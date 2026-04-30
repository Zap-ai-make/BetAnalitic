import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ExpertiseLevel, AnalysisDepth } from "@prisma/client";

// Available sports for preferences
const AVAILABLE_SPORTS = [
  "football",
  "basketball",
  "tennis",
  "rugby",
  "hockey",
  "baseball",
  "mma",
  "boxing",
  "esports",
] as const;

// Profile update schema
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères")
    .optional(),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
    )
    .optional(),
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
  avatarUrl: z.string().url("URL invalide").optional().nullable(),
});

// Preferences update schema
const updatePreferencesSchema = z.object({
  expertiseLevel: z.nativeEnum(ExpertiseLevel).optional(),
  favoriteSports: z.array(z.string()).max(5, "Maximum 5 sports").optional(),
  favoriteTeams: z.array(z.string()).max(10, "Maximum 10 équipes").optional(),
  analysisDepth: z.nativeEnum(AnalysisDepth).optional(),
  language: z.enum(["fr", "en"]).optional(),
});

export const profileRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: true,
        expertiseLevel: true,
        favoriteSports: true,
        favoriteTeams: true,
        analysisDepth: true,
        language: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    return user;
  }),

  /**
   * Update avatar — accepts base64 data URL, stored directly in DB
   */
  updateAvatar: protectedProcedure
    .input(z.object({
      dataUrl: z.string()
        .startsWith("data:image/", "Format invalide")
        .max(400_000, "Image trop grande (max ~300 KB)"),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.user.updateMany({
        where: { id: ctx.session.user.id },
        data: { avatarUrl: input.dataUrl },
      });
      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session expirée. Déconnectez-vous et reconnectez-vous.",
        });
      }
      return { success: true };
    }),

  /**
   * Update user profile info
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { username, displayName, bio, avatarUrl } = input;

      // Check username uniqueness if being changed
      if (username) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            username,
            id: { not: ctx.session.user.id },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce nom d'utilisateur est déjà pris",
          });
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(username && { username }),
          ...(displayName !== undefined && { displayName }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        expertiseLevel,
        favoriteSports,
        favoriteTeams,
        analysisDepth,
        language,
      } = input;

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(expertiseLevel && { expertiseLevel }),
          ...(favoriteSports && { favoriteSports }),
          ...(favoriteTeams && { favoriteTeams }),
          ...(analysisDepth && { analysisDepth }),
          ...(language && { language }),
        },
        select: {
          expertiseLevel: true,
          favoriteSports: true,
          favoriteTeams: true,
          analysisDepth: true,
          language: true,
        },
      });

      return {
        success: true,
        preferences: updatedUser,
      };
    }),

  /**
   * Check username availability
   */
  checkUsernameAvailable: protectedProcedure
    .input(z.object({ username: z.string().min(3).max(20) }))
    .query(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findFirst({
        where: {
          username: input.username,
          id: { not: ctx.session.user.id },
        },
      });

      return { available: !existingUser };
    }),

  /**
   * Get available sports list
   */
  getAvailableSports: protectedProcedure.query(() => {
    return AVAILABLE_SPORTS.map((sport) => ({
      id: sport,
      label: getSportLabel(sport),
    }));
  }),
});

function getSportLabel(sport: string): string {
  const labels: Record<string, string> = {
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    rugby: "Rugby",
    hockey: "Hockey",
    baseball: "Baseball",
    mma: "MMA",
    boxing: "Boxe",
    esports: "Esports",
  };
  return labels[sport] ?? sport;
}
