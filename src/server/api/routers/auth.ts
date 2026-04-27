import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

// Registration input schema
const registerSchema = z
  .object({
    // Email/password registration
    email: z.string().email("Email invalide").optional(),
    // OR phone/username registration
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide")
      .optional(),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
      ),
    password: passwordSchema,
    ageVerified: z.literal(true, {
      errorMap: () => ({
        message: "Vous devez confirmer avoir 18 ans ou plus",
      }),
    }),
    // Referral code (Story 11.2)
    referralCode: z.string().optional(),
  })
  .refine((data) => data.email ?? data.phone, {
    message: "Email ou numéro de téléphone requis",
    path: ["email"],
  });

// Login input schema
const loginSchema = z.object({
  identifier: z.string().min(1, "Email, téléphone ou nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

// BCRYPT cost factor (12+ recommended for production)
const BCRYPT_COST = 12;

// Token expiration times
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

// Rate limiting for magic links (in-memory, use Redis in production)
const magicLinkAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAGIC_LINK_RATE_LIMIT = 3 // max requests
const MAGIC_LINK_RATE_WINDOW = 60 * 60 * 1000 // per hour

export const authRouter = createTRPCRouter({
  /**
   * Register a new user
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const { email, phone, username, password, ageVerified, referralCode } = input;

    // Check if username already exists
    const existingUsername = await ctx.db.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ce nom d'utilisateur est déjà pris",
      });
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await ctx.db.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte avec cet email existe déjà",
        });
      }
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await ctx.db.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte avec ce numéro existe déjà",
        });
      }
    }

    // Hash password with bcrypt (cost 12)
    const passwordHash = await hash(password, BCRYPT_COST);

    // Create user
    const user = await ctx.db.user.create({
      data: {
        email: email ?? null,
        phone: phone ?? null,
        username,
        passwordHash,
        ageVerified,
        displayName: username,
        // Auto-verify in dev (remove in production)
        emailVerified: email ? new Date() : null,
        phoneVerified: phone ? new Date() : null,
      },
    });

    // Sync user to BetAnalytic backend (non-blocking — registration succeeds even if this fails)
    try {
      const { createBetaUser } = await import("~/lib/betanalytic");
      const betaResult = await createBetaUser({ email: email ?? undefined, username, tier: "FREE" });
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          betanalyticId: betaResult.user.id ?? null,
          betanalyticApiKey: betaResult.user.api_key ?? null,
        },
      });
    } catch (betaError) {
      console.error("BetAnalytic user sync failed (non-blocking):", betaError);
    }

    // Verification skipped — user is auto-verified on creation

    // Process referral code if provided (Story 11.2)
    let referralBonus = 0;
    if (referralCode) {
      try {
        // Import referral router to call processReferralSignup
        const { referralRouter } = await import("~/server/api/routers/referral");
        const caller = referralRouter.createCaller(ctx);
        const referralResult = await caller.processReferralSignup({
          referralCode,
          newUserId: user.id,
        });
        if (referralResult.success) {
          referralBonus = referralResult.welcomeBonus ?? 0;
        }
      } catch (error) {
        // Log error but don't fail registration
        console.error("Referral processing failed:", error);
      }
    }

    // TODO: Send verification email/SMS
    // For now, just return success
    // In production: integrate with Resend, SendGrid, Twilio, etc.

    return {
      success: true,
      userId: user.id,
      verificationRequired: false,
      verificationType: email ? "email" : "phone",
      referralBonus,
    };
  }),

  /**
   * Login with email/phone/username and password
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { identifier, password } = input;

    // Find user by email, phone, or username
    const user = await ctx.db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Identifiants invalides",
      });
    }

    // Verify password
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Identifiants invalides",
      });
    }

    // Check email/phone verification
    if (user.email && !user.emailVerified) {
      return {
        success: false,
        requiresVerification: true,
        verificationType: "email",
      };
    }

    if (user.phone && !user.phoneVerified && !user.email) {
      return {
        success: false,
        requiresVerification: true,
        verificationType: "phone",
      };
    }

    // Create session
    const sessionToken = randomBytes(32).toString("hex");
    const session = await ctx.db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY),
        // TODO: Extract from request headers
        // userAgent: ctx.req?.headers['user-agent'],
        // ipAddress: ctx.req?.ip,
      },
    });

    // Update last login
    await ctx.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      success: true,
      sessionToken: session.token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
      },
    };
  }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token: input.token },
        include: { user: true },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token de vérification invalide",
        });
      }

      if (verificationToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de vérification expiré",
        });
      }

      if (verificationToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de vérification déjà utilisé",
        });
      }

      // Mark token as used
      await ctx.db.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      });

      // Update user verification status
      if (verificationToken.type === "EMAIL_VERIFICATION") {
        await ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: { emailVerified: new Date() },
        });
      } else if (verificationToken.type === "PHONE_VERIFICATION") {
        await ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: { phoneVerified: new Date() },
        });
      }

      return { success: true };
    }),

  /**
   * Check if email/username/phone is available
   */
  checkAvailability: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        username: z.string().min(3).optional(),
        phone: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result: Record<string, boolean> = {};

      if (input.email) {
        const existing = await ctx.db.user.findUnique({
          where: { email: input.email },
        });
        result.emailAvailable = !existing;
      }

      if (input.username) {
        const existing = await ctx.db.user.findUnique({
          where: { username: input.username },
        });
        result.usernameAvailable = !existing;
      }

      if (input.phone) {
        const existing = await ctx.db.user.findUnique({
          where: { phone: input.phone },
        });
        result.phoneAvailable = !existing;
      }

      return result;
    }),

  /**
   * Request password reset
   * Always returns success to prevent email enumeration
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ identifier: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { identifier } = input;

      // Find user by email or phone
      const user = await ctx.db.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
      });

      // Always return success to prevent enumeration
      if (!user) {
        return { success: true };
      }

      // Delete any existing password reset tokens for this user
      await ctx.db.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: "PASSWORD_RESET",
        },
      });

      // Generate new reset token
      const resetToken = randomBytes(32).toString("hex");
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          type: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
        },
      });

      // TODO: Send reset email/SMS — integrate with Resend/SendGrid/Twilio

      return { success: true };
    }),

  /**
   * Validate reset token (check if valid before showing form)
   */
  validateResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const resetToken = await ctx.db.verificationToken.findUnique({
        where: { token: input.token },
      });

      if (!resetToken) {
        return { valid: false, reason: "Token invalide" };
      }

      if (resetToken.type !== "PASSWORD_RESET") {
        return { valid: false, reason: "Token invalide" };
      }

      if (resetToken.expiresAt < new Date()) {
        return { valid: false, reason: "Token expiré" };
      }

      if (resetToken.usedAt) {
        return { valid: false, reason: "Token déjà utilisé" };
      }

      return { valid: true };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: passwordSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token, newPassword } = input;

      // Find and validate token
      const resetToken = await ctx.db.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token de réinitialisation invalide",
        });
      }

      if (resetToken.type !== "PASSWORD_RESET") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de réinitialisation invalide",
        });
      }

      if (resetToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de réinitialisation expiré",
        });
      }

      if (resetToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de réinitialisation déjà utilisé",
        });
      }

      // Hash new password
      const passwordHash = await hash(newPassword, BCRYPT_COST);

      // Update password
      await ctx.db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Mark token as used
      await ctx.db.verificationToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all existing sessions for this user
      await ctx.db.session.deleteMany({
        where: { userId: resetToken.userId },
      });

      // TODO: Send confirmation email
      // In production: notify user their password was changed

      return { success: true };
    }),

  /**
   * Request magic link login
   * Rate limited to 3 requests per hour per email
   */
  requestMagicLink: publicProcedure
    .input(z.object({ email: z.string().email("Email invalide") }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      const now = Date.now();

      // Check rate limit
      const attempts = magicLinkAttempts.get(email);
      if (attempts) {
        // Reset if window has passed
        if (now - attempts.firstAttempt > MAGIC_LINK_RATE_WINDOW) {
          magicLinkAttempts.delete(email);
        } else if (attempts.count >= MAGIC_LINK_RATE_LIMIT) {
          const minutesLeft = Math.ceil(
            (MAGIC_LINK_RATE_WINDOW - (now - attempts.firstAttempt)) / 60000
          );
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Trop de demandes. Réessayez dans ${minutesLeft} minutes.`,
          });
        }
      }

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      // Always record attempt (even for non-existent users to prevent enumeration timing)
      const currentAttempts = magicLinkAttempts.get(email);
      if (currentAttempts) {
        magicLinkAttempts.set(email, {
          count: currentAttempts.count + 1,
          firstAttempt: currentAttempts.firstAttempt,
        });
      } else {
        magicLinkAttempts.set(email, { count: 1, firstAttempt: now });
      }

      // Return success even if user doesn't exist (prevent enumeration)
      if (!user) {
        return { success: true };
      }

      // Delete any existing magic link tokens for this user
      await ctx.db.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: "MAGIC_LINK",
        },
      });

      // Generate new magic link token
      const magicToken = randomBytes(32).toString("hex");
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          token: magicToken,
          type: "MAGIC_LINK",
          expiresAt: new Date(now + MAGIC_LINK_EXPIRY),
        },
      });

      // TODO: Send magic link email — integrate with Resend/SendGrid

      return { success: true };
    }),

  /**
   * Verify magic link and create session
   */
  verifyMagicLink: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;

      // Find and validate token
      const magicToken = await ctx.db.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!magicToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lien invalide ou expiré",
        });
      }

      if (magicToken.type !== "MAGIC_LINK") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lien invalide",
        });
      }

      if (magicToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce lien a expiré. Demandez un nouveau lien.",
        });
      }

      if (magicToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce lien a déjà été utilisé. Demandez un nouveau lien.",
        });
      }

      // Mark token as used
      await ctx.db.verificationToken.update({
        where: { id: magicToken.id },
        data: { usedAt: new Date() },
      });

      // Mark email as verified if not already
      if (!magicToken.user.emailVerified) {
        await ctx.db.user.update({
          where: { id: magicToken.userId },
          data: { emailVerified: new Date() },
        });
      }

      // Update last login
      await ctx.db.user.update({
        where: { id: magicToken.userId },
        data: { lastLoginAt: new Date() },
      });

      // Return user info for session creation
      return {
        success: true,
        user: {
          id: magicToken.user.id,
          email: magicToken.user.email,
          username: magicToken.user.username,
          name: magicToken.user.displayName ?? magicToken.user.username,
          subscriptionTier: magicToken.user.subscriptionTier,
        },
      };
    }),
});
