/**
 * Input Sanitization & Security
 * Story 4.10: Prevents injection attacks and validates user inputs
 */

export interface SanitizationResult {
  isValid: boolean
  sanitizedInput: string
  blocked: boolean
  reason?: string
}

// Max input lengths
const MAX_QUERY_LENGTH = 500
const MAX_AGENT_ID_LENGTH = 50

// Dangerous patterns (intentionally vague to not help attackers)
const INJECTION_PATTERNS = [
  // Script injection
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  /--\s*$/gm,
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/gi,
  // NoSQL injection
  /\$where\s*:/gi,
  /\$gt\s*:/gi,
  /\$lt\s*:/gi,
  /\$ne\s*:/gi,
  // Path traversal
  /\.\.\//g,
  // Command injection
  /[;&|`$]/g,
]

// HTML entities to escape
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
}

/**
 * Escape HTML special characters
 */
function escapeHtml(input: string): string {
  return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char)
}

/**
 * Check for injection patterns
 */
function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input))
}

/**
 * Log security incident (server-side only)
 */
function logSecurityIncident(
  type: string,
  input: string,
  userId?: string
): void {
  // In production, this would send to a security monitoring service
  console.warn("[SECURITY]", {
    type,
    timestamp: new Date().toISOString(),
    inputPreview: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
    userId: userId ?? "anonymous",
  })
}

/**
 * Sanitize user query input
 */
export function sanitizeQuery(
  input: string,
  userId?: string
): SanitizationResult {
  // Trim whitespace
  const trimmed = input.trim()

  // Check length
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: false,
      reason: "empty",
    }
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      sanitizedInput: trimmed.slice(0, MAX_QUERY_LENGTH),
      blocked: false,
      reason: "too_long",
    }
  }

  // Check for injection patterns
  if (detectInjection(trimmed)) {
    logSecurityIncident("injection_attempt", trimmed, userId)
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: true,
      // Generic message to prevent probing
      reason: "invalid_input",
    }
  }

  // Escape HTML
  const sanitized = escapeHtml(trimmed)

  return {
    isValid: true,
    sanitizedInput: sanitized,
    blocked: false,
  }
}

/**
 * Sanitize agent ID
 */
export function sanitizeAgentId(input: string): SanitizationResult {
  const trimmed = input.trim().toLowerCase()

  // Check length
  if (trimmed.length === 0 || trimmed.length > MAX_AGENT_ID_LENGTH) {
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: false,
      reason: "invalid_length",
    }
  }

  // Agent IDs should only contain lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: true,
      reason: "invalid_format",
    }
  }

  return {
    isValid: true,
    sanitizedInput: trimmed,
    blocked: false,
  }
}

/**
 * Validate and sanitize match ID
 */
export function sanitizeMatchId(input: string): SanitizationResult {
  const trimmed = input.trim()

  // Match IDs should be alphanumeric
  if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: true,
      reason: "invalid_format",
    }
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      sanitizedInput: "",
      blocked: false,
      reason: "too_long",
    }
  }

  return {
    isValid: true,
    sanitizedInput: trimmed,
    blocked: false,
  }
}

/**
 * Generic input validator for tRPC procedures
 */
export function validateAgentInput(input: {
  query: string
  agentId: string
  matchId?: string
  userId?: string
}): { valid: boolean; error?: string } {
  const queryResult = sanitizeQuery(input.query, input.userId)
  if (!queryResult.isValid) {
    return {
      valid: false,
      error: queryResult.blocked
        ? "Requête invalide"
        : queryResult.reason === "empty"
          ? "Veuillez entrer une question"
          : "Question trop longue (max 500 caractères)",
    }
  }

  const agentResult = sanitizeAgentId(input.agentId)
  if (!agentResult.isValid) {
    return {
      valid: false,
      error: "Agent invalide",
    }
  }

  if (input.matchId) {
    const matchResult = sanitizeMatchId(input.matchId)
    if (!matchResult.isValid) {
      return {
        valid: false,
        error: "Match invalide",
      }
    }
  }

  return { valid: true }
}
