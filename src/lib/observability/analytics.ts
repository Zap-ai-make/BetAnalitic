/**
 * Story 15.1: Analytics & Observability
 * Client-side analytics and performance tracking
 */

type EventName =
  | "page_view"
  | "agent_query"
  | "bet_placed"
  | "room_joined"
  | "debate_vote"
  | "expert_followed"
  | "subscription_started"
  | "subscription_cancelled"
  | "error"

interface AnalyticsEvent {
  name: EventName
  properties?: Record<string, unknown>
  timestamp: Date
  userId?: string
  sessionId: string
}

interface PerformanceMetric {
  name: string
  value: number
  unit: "ms" | "bytes" | "count"
  timestamp: Date
}

// Session ID generation
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// Singleton analytics instance
class Analytics {
  private sessionId: string
  private userId?: string
  private queue: AnalyticsEvent[] = []
  private isEnabled = true

  constructor() {
    this.sessionId = generateSessionId()

    // Flush queue periodically
    if (typeof window !== "undefined") {
      setInterval(() => void this.flush(), 30000)

      // Flush on page unload
      window.addEventListener("beforeunload", () => void this.flush())
    }
  }

  setUserId(userId: string | undefined): void {
    this.userId = userId
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  track(name: EventName, properties?: Record<string, unknown>): void {
    if (!this.isEnabled) return

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.queue.push(event)

    // Immediate flush for important events
    if (["subscription_started", "bet_placed", "error"].includes(name)) {
      void this.flush()
    }
  }

  pageView(path: string, title?: string): void {
    this.track("page_view", { path, title })
  }

  error(error: Error, context?: Record<string, unknown>): void {
    this.track("error", {
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    // In production, send to analytics endpoint
    if (process.env.NODE_ENV === "production") {
      try {
        await fetch("/api/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events }),
        })
      } catch {
        // Re-queue on failure
        this.queue = [...events, ...this.queue]
      }
    } else {
      // Log in development
      console.log("[Analytics]", events)
    }
  }
}

// Performance tracking
class PerformanceTracker {
  private metrics: PerformanceMetric[] = []

  measure(name: string, startTime: number): void {
    const duration = performance.now() - startTime

    this.metrics.push({
      name,
      value: duration,
      unit: "ms",
      timestamp: new Date(),
    })

    // Report slow operations
    if (duration > 3000) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(0)}ms`)
    }
  }

  trackWebVitals(): void {
    if (typeof window === "undefined") return

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.metrics.push({
          name: "LCP",
          value: lastEntry.startTime,
          unit: "ms",
          timestamp: new Date(),
        })
      }
    })
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })

    // FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if ("processingStart" in entry) {
          this.metrics.push({
            name: "FID",
            value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
            unit: "ms",
            timestamp: new Date(),
          })
        }
      })
    })
    fidObserver.observe({ type: "first-input", buffered: true })
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }
}

// Export singleton instances
export const analytics = new Analytics()
export const performanceTracker = new PerformanceTracker()

// Convenience functions
export function trackEvent(name: EventName, properties?: Record<string, unknown>): void {
  analytics.track(name, properties)
}

export function trackPageView(path: string, title?: string): void {
  analytics.pageView(path, title)
}

export function trackError(error: Error, context?: Record<string, unknown>): void {
  analytics.error(error, context)
}

// React hook for page tracking
export function usePageTracking(path: string, title?: string): void {
  if (typeof window !== "undefined") {
    trackPageView(path, title)
  }
}
