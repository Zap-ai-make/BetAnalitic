/**
 * Distributed Tracing (Story 15.4)
 * Simple tracing for request flows across services
 * In production, integrate with OpenTelemetry
 */

import { logger } from "./logger";
import { appMetrics } from "./metrics";

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes?: Record<string, string | number | boolean>;
  status?: "ok" | "error";
  error?: Error;
}

class Tracer {
  private activeSpans = new Map<string, Span>();

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    attributes?: Record<string, string | number | boolean>,
    parentSpanId?: string,
  ): string {
    const spanId = this.generateId();
    const traceId = parentSpanId
      ? this.activeSpans.get(parentSpanId)?.traceId ?? this.generateId()
      : this.generateId();

    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      name,
      startTime: Date.now(),
      attributes,
    };

    this.activeSpans.set(spanId, span);

    logger.debug(`Span started: ${name}`, {
      traceId,
      spanId,
      parentSpanId,
    });

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string, status: "ok" | "error" = "ok", error?: Error): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      logger.warn("Attempted to end non-existent span", { spanId });
      return;
    }

    span.endTime = Date.now();
    span.status = status;
    span.error = error;

    const duration = span.endTime - span.startTime;

    logger.debug(`Span ended: ${span.name}`, {
      traceId: span.traceId,
      spanId,
      duration,
      status,
    });

    // Record metrics
    if (span.name.startsWith("trpc.")) {
      appMetrics.trpcCallDuration(span.name, duration);
    } else if (span.name.startsWith("db.")) {
      appMetrics.dbQueryDuration(span.name, duration);
    }

    // In production, export to OpenTelemetry collector
    this.exportSpan(span, duration);

    // Cleanup
    this.activeSpans.delete(spanId);
  }

  /**
   * Add attributes to active span
   */
  setSpanAttributes(
    spanId: string,
    attributes: Record<string, string | number | boolean>,
  ): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.attributes = { ...span.attributes, ...attributes };
    }
  }

  /**
   * Helper to trace a function execution
   */
  async trace<T>(
    name: string,
    fn: (spanId: string) => Promise<T>,
    parentSpanId?: string,
  ): Promise<T> {
    const spanId = this.startSpan(name, undefined, parentSpanId);
    try {
      const result = await fn(spanId);
      this.endSpan(spanId, "ok");
      return result;
    } catch (error) {
      this.endSpan(spanId, "error", error as Error);
      throw error;
    }
  }

  /**
   * Helper for synchronous tracing
   */
  traceSync<T>(name: string, fn: (spanId: string) => T, parentSpanId?: string): T {
    const spanId = this.startSpan(name, undefined, parentSpanId);
    try {
      const result = fn(spanId);
      this.endSpan(spanId, "ok");
      return result;
    } catch (error) {
      this.endSpan(spanId, "error", error as Error);
      throw error;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private exportSpan(span: Span, duration: number): void {
    // In production, export to OpenTelemetry collector
    // For now, just log for visibility
    if (process.env.NODE_ENV === "development") {
      console.log("[Trace]", {
        trace_id: span.traceId,
        span_id: span.spanId,
        parent_span_id: span.parentSpanId,
        name: span.name,
        duration_ms: duration,
        status: span.status,
        attributes: span.attributes,
      });
    }
  }
}

// Global tracer instance
export const tracer = new Tracer();

/**
 * Decorator for tracing class methods
 */
export function Trace(spanName?: string) {
  return function (
    target: { constructor: { name: string } },
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const name = spanName ?? `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return tracer.trace(name, async () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
