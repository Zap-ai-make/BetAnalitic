/**
 * Application Metrics (Story 15.3)
 * Prometheus-compatible metrics for monitoring
 */

/**
 * Simple in-memory metrics store
 * In production, use prom-client library with actual Prometheus
 */

class MetricsRegistry {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value = 1, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record a histogram value (for latency, size, etc.)
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) ?? [];
    values.push(value);
    this.histograms.set(key, values);
  }

  /**
   * Get all metrics in Prometheus format
   */
  getMetrics(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges.entries()) {
      lines.push(`${key} ${value}`);
    }

    // Histograms (simplified - just sum and count)
    for (const [key, values] of this.histograms.entries()) {
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      lines.push(`${key}_sum ${sum}`);
      lines.push(`${key}_count ${count}`);
    }

    return lines.join("\n");
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `${name}{${labelStr}}`;
  }
}

// Global metrics registry
export const metrics = new MetricsRegistry();

/**
 * Common application metrics
 */
export const appMetrics = {
  // HTTP metrics
  httpRequestsTotal: (method: string, path: string, status: number) =>
    metrics.incrementCounter("http_requests_total", 1, { method, path, status: String(status) }),

  httpRequestDuration: (method: string, path: string, duration: number) =>
    metrics.recordHistogram("http_request_duration_ms", duration, { method, path }),

  // tRPC metrics
  trpcCallsTotal: (procedure: string, status: "success" | "error") =>
    metrics.incrementCounter("trpc_calls_total", 1, { procedure, status }),

  trpcCallDuration: (procedure: string, duration: number) =>
    metrics.recordHistogram("trpc_call_duration_ms", duration, { procedure }),

  // Database metrics
  dbQueriesTotal: (operation: string) =>
    metrics.incrementCounter("db_queries_total", 1, { operation }),

  dbQueryDuration: (operation: string, duration: number) =>
    metrics.recordHistogram("db_query_duration_ms", duration, { operation }),

  // Agent metrics
  agentInvocationsTotal: (agent: string, status: "success" | "error") =>
    metrics.incrementCounter("agent_invocations_total", 1, { agent, status }),

  agentResponseDuration: (agent: string, duration: number) =>
    metrics.recordHistogram("agent_response_duration_ms", duration, { agent }),

  // User metrics
  activeUsers: (count: number) => metrics.setGauge("active_users", count),

  // System metrics
  memoryUsage: () => {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const mem = process.memoryUsage();
      metrics.setGauge("memory_heap_used_bytes", mem.heapUsed);
      metrics.setGauge("memory_heap_total_bytes", mem.heapTotal);
      metrics.setGauge("memory_rss_bytes", mem.rss);
    }
  },
};

/**
 * Middleware to track HTTP request metrics
 */
export function createMetricsMiddleware() {
  return (req: Request, startTime: number, res: Response) => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const path = new URL(req.url).pathname;
    const status = res.status;

    appMetrics.httpRequestsTotal(method, path, status);
    appMetrics.httpRequestDuration(method, path, duration);
  };
}
