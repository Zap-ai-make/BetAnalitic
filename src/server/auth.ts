import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { randomBytes } from "crypto"
import { db } from "~/server/db"

// Maximum concurrent sessions per user
const MAX_SESSIONS = 3
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Module augmentation for `next-auth` types.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      subscriptionTier: "FREE" | "PREMIUM" | "EXPERT"
      role: "USER" | "MODERATOR" | "ADMIN"
    } & DefaultSession["user"]
    sessionId?: string
  }

  interface User {
    id: string
    username: string
    subscriptionTier: "FREE" | "PREMIUM" | "EXPERT"
    role: "USER" | "MODERATOR" | "ADMIN"
    dbSessionId?: string
  }
}

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutEndsAt?: Date } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier)
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const lockoutEndsAt = new Date(attempts.lastAttempt + LOCKOUT_DURATION)
    return { allowed: false, remainingAttempts: 0, lockoutEndsAt }
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts.count }
}

function recordFailedAttempt(identifier: string): void {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
  } else {
    loginAttempts.set(identifier, { count: attempts.count + 1, lastAttempt: now })
  }
}

function clearAttempts(identifier: string): void {
  loginAttempts.delete(identifier)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email/Username/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Identifiants requis")
        }

        const identifier = credentials.identifier as string
        const password = credentials.password as string

        // Check rate limiting
        const rateLimit = checkRateLimit(identifier)
        if (!rateLimit.allowed) {
          throw new Error(`Compte temporairement bloqué. Réessayez dans ${Math.ceil((rateLimit.lockoutEndsAt!.getTime() - Date.now()) / 60000)} minutes.`)
        }

        // Find user by email, phone, or username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier },
              { username: identifier },
            ],
          },
        })

        if (!user) {
          recordFailedAttempt(identifier)
          throw new Error("Identifiants invalides")
        }

        // Verify password
        const passwordValid = await compare(password, user.passwordHash)
        if (!passwordValid) {
          recordFailedAttempt(identifier)
          throw new Error("Identifiants invalides")
        }

        // Check email/phone verification (disabled in dev)
        // TODO: Re-enable in production with email service
        // if (user.email && !user.emailVerified) {
        //   throw new Error("Veuillez vérifier votre email avant de vous connecter")
        // }

        // if (user.phone && !user.phoneVerified && !user.email) {
        //   throw new Error("Veuillez vérifier votre téléphone avant de vous connecter")
        // }

        // Clear rate limit on successful login
        clearAttempts(identifier)

        // Check session limit
        const activeSessions = await db.session.count({
          where: {
            userId: user.id,
            expiresAt: { gt: new Date() },
          },
        })

        if (activeSessions >= MAX_SESSIONS) {
          // Delete oldest session to make room
          const oldestSession = await db.session.findFirst({
            where: {
              userId: user.id,
              expiresAt: { gt: new Date() },
            },
            orderBy: { lastActiveAt: "asc" },
          })
          if (oldestSession) {
            await db.session.delete({ where: { id: oldestSession.id } })
          }
        }

        // Create database session
        const dbSession = await db.session.create({
          data: {
            userId: user.id,
            token: randomBytes(32).toString("hex"),
            expiresAt: new Date(Date.now() + SESSION_EXPIRY),
            // userAgent and ipAddress will be set from request headers if available
          },
        })

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          username: user.username,
          image: user.avatarUrl,
          subscriptionTier: user.subscriptionTier,
          role: user.role,
          dbSessionId: dbSession.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.subscriptionTier = user.subscriptionTier
        token.role = user.role
        token.sessionId = user.dbSessionId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.subscriptionTier = token.subscriptionTier as "FREE" | "PREMIUM" | "EXPERT"
        session.user.role = token.role as "USER" | "MODERATOR" | "ADMIN"
        session.sessionId = token.sessionId as string | undefined
      }
      return session
    },
  },
})

/**
 * Wrapper for `auth()` for server-side usage
 */
export const getServerAuthSession = auth
