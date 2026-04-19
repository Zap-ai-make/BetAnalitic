/**
 * Health Check Endpoint (Story 15.5)
 * Provides system health status for monitoring and k8s readiness probes
 */

import { NextResponse } from "next/server";
import { db } from "~/server/db";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: "healthy" | "unhealthy";
    memory: "healthy" | "degraded" | "unhealthy";
  };
  version?: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck["checks"] = {
    database: "unhealthy",
    memory: "healthy",
  };

  // Check database connection
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch (error) {
    checks.database = "unhealthy";
  }

  // Check memory usage (Node.js only)
  if (typeof process !== "undefined" && process.memoryUsage) {
    const mem = process.memoryUsage();
    const heapUsedPercent = (mem.heapUsed / mem.heapTotal) * 100;

    if (heapUsedPercent > 90) {
      checks.memory = "unhealthy";
    } else if (heapUsedPercent > 75) {
      checks.memory = "degraded";
    }
  }

  // Determine overall status
  let status: HealthCheck["status"] = "healthy";
  if (checks.database === "unhealthy" || checks.memory === "unhealthy") {
    status = "unhealthy";
  } else if (checks.memory === "degraded") {
    status = "degraded";
  }

  const healthCheck: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    uptime: typeof process !== "undefined" ? process.uptime() : 0,
    checks,
    version: process.env.npm_package_version,
  };

  const responseTime = Date.now() - startTime;

  return NextResponse.json(healthCheck, {
    status: status === "healthy" ? 200 : status === "degraded" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Response-Time": `${responseTime}ms`,
    },
  });
}
