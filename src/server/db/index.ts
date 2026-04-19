import { PrismaClient } from "@prisma/client";
import { createQueryMonitoringMiddleware } from "~/lib/observability/db-monitoring";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Add query monitoring middleware (Story 15.7)
  prisma.$use(createQueryMonitoringMiddleware());

  return prisma;
};

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma[prop];
  },
});
