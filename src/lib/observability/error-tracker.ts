/**
 * Error Tracking (Story 15.2)
 * Centralized error tracking with context and breadcrumbs
 * In production, integrate with Sentry
 */

import { logger } from "./logger";

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  component?: string;
  [key: string]: unknown;
}

interface Breadcrumb {
  timestamp: number;
  category: string;
  message: string;
  level: "debug" | "info" | "warning" | "error";
  data?: Record<string, unknown>;
}

class ErrorTracker {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 100;
  private context: ErrorContext = {};

  /**
   * Set global context for all error reports
   */
  setContext(context: ErrorContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Add a breadcrumb (trail of events leading to error)
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, "timestamp">): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now(),
    });

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Capture an exception
   */
  captureException(
    error: Error,
    context?: ErrorContext,
    level: "error" | "warning" = "error",
  ): void {
    const fullContext = { ...this.context, ...context };

    // Log to structured logger
    logger.error(error.message, error, fullContext);

    // In production, send to Sentry:
    // if (typeof window !== 'undefined') {
    //   Sentry.captureException(error, {
    //     contexts: { custom: fullContext },
    //     breadcrumbs: this.breadcrumbs,
    //   });
    // }

    // Store error for analytics
    this.storeError(error, fullContext, level);
  }

  /**
   * Capture a message (non-exception error)
   */
  captureMessage(
    message: string,
    context?: ErrorContext,
    level: "info" | "warning" | "error" = "info",
  ): void {
    const fullContext = { ...this.context, ...context };

    if (level === "error" || level === "warning") {
      logger.warn(message, fullContext);
    } else {
      logger.info(message, fullContext);
    }

    // In production, send to Sentry:
    // Sentry.captureMessage(message, { level, contexts: { custom: fullContext } });
  }

  /**
   * Clear breadcrumbs and context
   */
  clear(): void {
    this.breadcrumbs = [];
    this.context = {};
  }

  private storeError(error: Error, context: ErrorContext, level: string): void {
    // In production, store in database for analytics
    // For now, just log
    console.error("[ErrorTracker]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      level,
      breadcrumbs: this.breadcrumbs,
    });
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * React Error Boundary integration
 */
export function handleErrorBoundary(error: Error, errorInfo: { componentStack: string }): void {
  errorTracker.captureException(error, {
    component: "ErrorBoundary",
    componentStack: errorInfo.componentStack,
  });
}

/**
 * Global error handler for unhandled errors
 */
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    errorTracker.captureException(event.error, {
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    errorTracker.captureException(
      new Error(`Unhandled Promise Rejection: ${String(event.reason)}`),
      {
        url: window.location.href,
        reason: event.reason,
      },
    );
  });
}
