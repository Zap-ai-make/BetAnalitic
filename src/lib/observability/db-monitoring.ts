/**
 * Database Query Monitoring (Story 15.7)
 * Prisma middleware for logging slow queries and tracking DB performance
 */

import type { Prisma } from "@prisma/client";
import { logger } from "./logger";
import { appMetrics } from "./metrics";
import { tracer } from "./tracing";

// Slow query threshold in milliseconds
const SLOW_QUERY_THRESHOLD = 1000;

/**
 * Prisma middleware for query monitoring
 */
export function createQueryMonitoringMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const startTime = Date.now();
    const spanId = tracer.startSpan(`db.${params.model ?? "unknown"}.${params.action}`);

    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Track metrics
      appMetrics.dbQueriesTotal(params.action);
      appMetrics.dbQueryDuration(params.action, duration);

      // Log slow queries
      if (duration > SLOW_QUERY_THRESHOLD) {
        logger.warn("Slow database query detected", {
          model: params.model,
          action: params.action,
          duration,
          args: sanitizeArgs(params.args),
        });
      }

      // Debug logging for all queries in development
      if (process.env.NODE_ENV === "development") {
        logger.debug("Database query", {
          model: params.model,
          action: params.action,
          duration,
        });
      }

      tracer.endSpan(spanId, "ok");
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Database query failed", error as Error, {
        model: params.model,
        action: params.action,
        duration,
        args: sanitizeArgs(params.args),
      });

      tracer.endSpan(spanId, "error", error as Error);
      throw error;
    }
  };
}

/**
 * Sanitize query arguments for logging (remove sensitive data)
 */
function sanitizeArgs(args: unknown): unknown {
  if (!args || typeof args !== "object") {
    return args;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    // Skip sensitive fields
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("secret")
    ) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === "object") {
      sanitized[key] = sanitizeArgs(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Query performance analyzer
 * Analyzes query patterns and suggests optimizations
 */
export class QueryAnalyzer {
  private queryStats = new Map<string, { count: number; totalDuration: number; maxDuration: number }>();

  /**
   * Record a query execution
   */
  recordQuery(model: string, action: string, duration: number): void {
    const key = `${model}.${action}`;
    const stats = this.queryStats.get(key) ?? { count: 0, totalDuration: 0, maxDuration: 0 };

    stats.count++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);

    this.queryStats.set(key, stats);
  }

  /**
   * Get performance report
   */
  getReport(): {
    query: string;
    count: number;
    avgDuration: number;
    maxDuration: number;
    score: number;
  }[] {
    const report = Array.from(this.queryStats.entries()).map(([query, stats]) => ({
      query,
      count: stats.count,
      avgDuration: stats.totalDuration / stats.count,
      maxDuration: stats.maxDuration,
      score: this.calculateScore(stats),
    }));

    // Sort by score (worst first)
    return report.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate performance score (higher = worse)
   */
  private calculateScore(stats: { count: number; totalDuration: number; maxDuration: number }): number {
    const avgDuration = stats.totalDuration / stats.count;
    // Score = frequency * average duration
    return stats.count * avgDuration;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.queryStats.clear();
  }
}

// Global query analyzer instance
export const queryAnalyzer = new QueryAnalyzer();

/**
 * Connection pool monitoring
 */
export function getConnectionPoolStats() {
  // In production, get real stats from Prisma
  // For now, return mock data
  return {
    activeConnections: 0,
    idleConnections: 0,
    totalConnections: 0,
    maxConnections: 10,
  };
}
