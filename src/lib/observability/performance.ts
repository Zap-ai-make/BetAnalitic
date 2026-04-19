/**
 * Frontend Performance Monitoring (Story 15.6)
 * Track Core Web Vitals and custom performance metrics
 */

import { appMetrics } from "./metrics";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
}

/**
 * Track Core Web Vitals (LCP, FID, CLS)
 */
export function trackWebVitals(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime: number;
        loadTime: number;
      };
      const lcp = lastEntry.renderTime || lastEntry.loadTime;

      appMetrics.httpRequestDuration("webvital", "lcp", lcp);

      const metric: PerformanceMetric = {
        name: "LCP",
        value: lcp,
        rating: lcp <= 2500 ? "good" : lcp <= 4000 ? "needs-improvement" : "poor",
      };

      reportMetric(metric);
    });

    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;

        appMetrics.httpRequestDuration("webvital", "fid", fid);

        const metric: PerformanceMetric = {
          name: "FID",
          value: fid,
          rating: fid <= 100 ? "good" : fid <= 300 ? "needs-improvement" : "poor",
        };

        reportMetric(metric);
      });
    });

    fidObserver.observe({ type: "first-input", buffered: true });
  } catch (e) {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as LayoutShift).hadRecentInput) {
          clsValue += (entry as LayoutShift).value;
        }
      });

      appMetrics.httpRequestDuration("webvital", "cls", clsValue * 1000); // Convert to ms for consistency

      const metric: PerformanceMetric = {
        name: "CLS",
        value: clsValue,
        rating: clsValue <= 0.1 ? "good" : clsValue <= 0.25 ? "needs-improvement" : "poor",
      };

      reportMetric(metric);
    });

    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch (e) {
    // CLS not supported
  }

  // Time to First Byte (TTFB)
  try {
    const navigationEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

      appMetrics.httpRequestDuration("webvital", "ttfb", ttfb);

      const metric: PerformanceMetric = {
        name: "TTFB",
        value: ttfb,
        rating: ttfb <= 800 ? "good" : ttfb <= 1800 ? "needs-improvement" : "poor",
      };

      reportMetric(metric);
    }
  } catch (e) {
    // Navigation Timing not supported
  }
}

/**
 * Track custom performance marks and measures
 */
export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  if (typeof window === "undefined" || !performance.measure) {
    return;
  }

  try {
    const measure = endMark
      ? performance.measure(name, startMark, endMark)
      : performance.measure(name, startMark);

    appMetrics.httpRequestDuration("performance", name, measure.duration);
  } catch (e) {
    console.warn(`Failed to measure performance: ${name}`, e);
  }
}

/**
 * Create a performance mark
 */
export function markPerformance(name: string): void {
  if (typeof window === "undefined" || !performance.mark) {
    return;
  }

  try {
    performance.mark(name);
  } catch (e) {
    console.warn(`Failed to create performance mark: ${name}`, e);
  }
}

/**
 * Report metric to analytics
 */
function reportMetric(metric: PerformanceMetric): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Performance]", metric);
  }

  // In production, send to analytics service
  // fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   keepalive: true,
  // });
}

/**
 * Monitor long tasks (blocking the main thread)
 */
export function trackLongTasks(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          // Tasks over 50ms are considered "long"
          console.warn(
            `[LongTask] ${entry.name} took ${entry.duration.toFixed(2)}ms`,
          );

          appMetrics.httpRequestDuration("longtask", entry.name, entry.duration);
        }
      });
    });

    observer.observe({ type: "longtask", buffered: true });
  } catch (e) {
    // Long tasks not supported
  }
}

// Types for PerformanceObserver entries
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}
