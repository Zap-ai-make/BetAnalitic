/**
 * Observability Module (Epic 15)
 * Centralized exports for all observability utilities
 */

// Story 15.1: Structured Logging
export { logger, createRequestLogger } from "./logger";

// Story 15.2: Error Tracking
export { errorTracker, handleErrorBoundary } from "./error-tracker";

// Story 15.3: Application Metrics
export { metrics, appMetrics, createMetricsMiddleware } from "./metrics";

// Story 15.4: Distributed Tracing
export { tracer, Trace } from "./tracing";

// Story 15.5: Health Checks (API endpoints, not exported)

// Story 15.6: Frontend Performance
export {
  trackWebVitals,
  measurePerformance,
  markPerformance,
  trackLongTasks,
} from "./performance";

// Story 15.7: Database Monitoring
export {
  createQueryMonitoringMiddleware,
  queryAnalyzer,
  getConnectionPoolStats,
} from "./db-monitoring";

// Story 15.8: Alerting
export {
  alertManager,
  alerts,
  WebhookChannel,
  EmailChannel,
  SlackChannel,
  type Alert,
  type AlertSeverity,
  type AlertChannel,
} from "./alerting";
