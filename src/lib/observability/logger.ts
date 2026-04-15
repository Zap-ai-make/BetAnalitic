/**
 * Story 15.6: Server-side Logger
 * Structured logging with levels and context
 */

type LogLevel = "debug" | "info" | "warn" | "error"

type LogContext = Record<string, unknown>

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  traceId?: string
}

// Log levels hierarchy
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class Logger {
  private minLevel: LogLevel
  private traceId?: string

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = process.env.LOG_LEVEL as LogLevel ?? minLevel
  }

  setTraceId(traceId: string): void {
    this.traceId = traceId
  }

  clearTraceId(): void {
    this.traceId = undefined
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel]
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId: this.traceId,
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return

    const entry = this.formatEntry(level, message, context)

    // In production, output JSON for log aggregation
    if (process.env.NODE_ENV === "production") {
      const output = JSON.stringify(entry)
      switch (level) {
        case "error":
          console.error(output)
          break
        case "warn":
          console.warn(output)
          break
        default:
          console.log(output)
      }
    } else {
      // In development, pretty print
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
      const contextStr = context ? ` ${JSON.stringify(context)}` : ""

      switch (level) {
        case "error":
          console.error(`${prefix} ${message}${contextStr}`)
          break
        case "warn":
          console.warn(`${prefix} ${message}${contextStr}`)
          break
        case "debug":
          console.debug(`${prefix} ${message}${contextStr}`)
          break
        default:
          console.log(`${prefix} ${message}${contextStr}`)
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  // Create child logger with preset context
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext)
  }
}

class ChildLogger {
  private parent: Logger
  private defaultContext: LogContext

  constructor(parent: Logger, defaultContext: LogContext) {
    this.parent = parent
    this.defaultContext = defaultContext
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.defaultContext, ...context })
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.defaultContext, ...context })
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.defaultContext, ...context })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, { ...this.defaultContext, ...context })
  }
}

// Export singleton
export const logger = new Logger()

// Request logger for API routes
export function createRequestLogger(req: Request): ChildLogger {
  const traceId = crypto.randomUUID()
  const url = new URL(req.url)

  logger.setTraceId(traceId)

  return logger.child({
    traceId,
    method: req.method,
    path: url.pathname,
  })
}

// Performance timing helper
export function createTimer(label: string): () => void {
  const start = performance.now()

  return () => {
    const duration = performance.now() - start
    logger.debug(`${label} completed`, { durationMs: duration.toFixed(2) })
  }
}

/**
 * Story 15.7: Rate Limit Logger
 */
export function logRateLimit(
  identifier: string,
  endpoint: string,
  remaining: number,
  limit: number
): void {
  if (remaining === 0) {
    logger.warn("Rate limit exceeded", { identifier, endpoint, limit })
  } else if (remaining < limit * 0.1) {
    logger.info("Rate limit approaching", { identifier, endpoint, remaining, limit })
  }
}

/**
 * Story 15.8: API Response Logger
 */
export function logApiResponse(
  endpoint: string,
  status: number,
  durationMs: number,
  context?: LogContext
): void {
  const message = `API Response: ${endpoint}`
  const fullContext = {
    status,
    durationMs: durationMs.toFixed(2),
    ...context,
  }

  if (status >= 500) {
    logger.error(message, undefined, fullContext)
  } else if (status >= 400) {
    logger.warn(message, fullContext)
  } else {
    logger.info(message, fullContext)
  }
}
