/**
 * Performance Monitor Component (Story 15.6)
 * Tracks Core Web Vitals and initializes performance monitoring
 */

"use client";

import { useEffect } from "react";
import { trackWebVitals, trackLongTasks } from "~/lib/observability/performance";

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    trackWebVitals();

    // Track long tasks that block the main thread
    trackLongTasks();
  }, []);

  // This component doesn't render anything
  return null;
}
