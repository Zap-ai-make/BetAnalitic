/**
 * Metrics Endpoint (Story 15.3)
 * Prometheus-compatible metrics endpoint for scraping
 */

import { NextResponse } from "next/server";
import { metrics, appMetrics } from "~/lib/observability/metrics";

export async function GET() {
  // Update system metrics before returning
  appMetrics.memoryUsage();

  // Get metrics in Prometheus format
  const metricsData = metrics.getMetrics();

  return new NextResponse(metricsData, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
