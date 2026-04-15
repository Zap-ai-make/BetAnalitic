/**
 * Story 6.13: Content Sanitization for Chat
 * Sanitizes user-generated content in real-time chat
 */

// Profanity patterns (French + common)
const PROFANITY_PATTERNS = [
  /\bmerde\b/gi,
  /\bputain\b/gi,
  /\bcon(nard|nasse)?\b/gi,
  /\bsalop(e|ard)?\b/gi,
  /\bencul[eé]\b/gi,
  /\bbordel\b/gi,
  /\bnique\b/gi,
  /\bfuck\b/gi,
  /\bshit\b/gi,
  /\bbitch\b/gi,
  /\basshole\b/gi,
]

// Spam patterns
const SPAM_PATTERNS = [
  /(.)\1{5,}/g, // Repeated characters (more than 5)
  /https?:\/\/[^\s]{100,}/gi, // Very long URLs
  /(buy now|click here|free money|winner)/gi,
]

// Betting scam patterns
const SCAM_PATTERNS = [
  /100%\s*(gagnant|sûr|garanti)/gi,
  /match\s*(truqu[eé]|fix[eé])/gi,
  /insider\s*(tip|info)/gi,
  /guaranteed\s*(win|profit)/gi,
  /free\s*bet(ting)?\s*tips?/gi,
]

// Personal info patterns
const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
  /\b(?:\+33|0033|0)[1-9](?:[\s.-]?\d{2}){4}\b/g, // French phone
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Card number pattern
]

interface SanitizeResult {
  content: string
  flags: SanitizeFlag[]
  blocked: boolean
  reason?: string
}

interface SanitizeFlag {
  type: "profanity" | "spam" | "scam" | "pii" | "length"
  original?: string
  position?: number
}

interface SanitizeOptions {
  maxLength?: number
  allowUrls?: boolean
  censorProfanity?: boolean
  blockScams?: boolean
  stripPii?: boolean
}

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  maxLength: 1000,
  allowUrls: true,
  censorProfanity: true,
  blockScams: true,
  stripPii: true,
}

/**
 * Sanitize chat message content
 */
export function sanitizeChatContent(
  content: string,
  options: SanitizeOptions = {}
): SanitizeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const flags: SanitizeFlag[] = []
  let sanitized = content.trim()
  let blocked = false
  let reason: string | undefined

  // Check length
  if (sanitized.length > opts.maxLength) {
    sanitized = sanitized.slice(0, opts.maxLength)
    flags.push({ type: "length" })
  }

  // Check for scams (block entirely)
  if (opts.blockScams) {
    for (const pattern of SCAM_PATTERNS) {
      const match = sanitized.match(pattern)
      if (match) {
        flags.push({ type: "scam", original: match[0] })
        blocked = true
        reason = "Ce message contient du contenu potentiellement frauduleux."
        break
      }
    }
  }

  if (blocked) {
    return { content: "", flags, blocked, reason }
  }

  // Censor profanity
  if (opts.censorProfanity) {
    for (const pattern of PROFANITY_PATTERNS) {
      const matches = sanitized.match(pattern)
      if (matches) {
        for (const match of matches) {
          flags.push({ type: "profanity", original: match })
        }
        sanitized = sanitized.replace(pattern, (m) => "*".repeat(m.length))
      }
    }
  }

  // Strip PII
  if (opts.stripPii) {
    for (const pattern of PII_PATTERNS) {
      const matches = sanitized.match(pattern)
      if (matches) {
        // Add a flag for each PII match found
        matches.forEach(() => flags.push({ type: "pii", original: "[REDACTED]" }))
        sanitized = sanitized.replace(pattern, "[info masquée]")
      }
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    const match = sanitized.match(pattern)
    if (match) {
      flags.push({ type: "spam", original: match[0] })
      // Clean up repeated characters
      sanitized = sanitized.replace(/(.)\1{5,}/g, "$1$1$1")
    }
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  return {
    content: sanitized,
    flags,
    blocked: false,
  }
}

/**
 * Quick check if content should be blocked
 */
export function shouldBlockContent(content: string): boolean {
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(content)) {
      return true
    }
  }
  return false
}

/**
 * Escape HTML entities
 */
export function escapeHtml(content: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }

  return content.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char)
}

/**
 * Parse simple markdown-like formatting
 */
export function parseSimpleFormatting(content: string): string {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
}

export type { SanitizeResult, SanitizeFlag, SanitizeOptions }
