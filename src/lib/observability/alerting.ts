/**
 * Alerting and Incident Response (Story 15.8)
 * Alert management and notification system for critical events
 */

import { logger } from "./logger";

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  notified?: boolean;
}

class AlertManager {
  private alerts: Alert[] = [];
  private maxAlerts = 1000;
  private notificationChannels: AlertChannel[] = [];

  /**
   * Register a notification channel
   */
  registerChannel(channel: AlertChannel): void {
    this.notificationChannels.push(channel);
  }

  /**
   * Create an alert
   */
  createAlert(
    severity: AlertSeverity,
    title: string,
    message: string,
    context?: Record<string, unknown>,
  ): Alert {
    const alert: Alert = {
      id: this.generateId(),
      severity,
      title,
      message,
      timestamp: Date.now(),
      context,
      notified: false,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }

    // Log the alert
    this.logAlert(alert);

    // Send notifications if critical or error
    if (severity === "critical" || severity === "error") {
      void this.notify(alert);
    }

    return alert;
  }

  /**
   * Get all alerts
   */
  getAlerts(severity?: AlertSeverity): Alert[] {
    if (severity) {
      return this.alerts.filter((a) => a.severity === severity);
    }
    return this.alerts;
  }

  /**
   * Get active alerts (last hour)
   */
  getActiveAlerts(): Alert[] {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.alerts.filter((a) => a.timestamp > oneHourAgo);
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  private async notify(alert: Alert): Promise<void> {
    for (const channel of this.notificationChannels) {
      try {
        await channel.send(alert);
        alert.notified = true;
      } catch (error) {
        logger.error("Failed to send alert notification", error as Error, {
          channel: channel.name,
          alert: alert.id,
        });
      }
    }
  }

  private logAlert(alert: Alert): void {
    const logContext = {
      alertId: alert.id,
      severity: alert.severity,
      ...alert.context,
    };

    switch (alert.severity) {
      case "critical":
      case "error":
        logger.error(`[ALERT] ${alert.title}: ${alert.message}`, undefined, logContext);
        break;
      case "warning":
        logger.warn(`[ALERT] ${alert.title}: ${alert.message}`, logContext);
        break;
      case "info":
        logger.info(`[ALERT] ${alert.title}: ${alert.message}`, logContext);
        break;
    }
  }

  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Alert notification channel interface
 */
export interface AlertChannel {
  name: string;
  send(alert: Alert): Promise<void>;
}

/**
 * Webhook notification channel
 */
export class WebhookChannel implements AlertChannel {
  name = "webhook";

  constructor(private webhookUrl: string) {}

  async send(alert: Alert): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        timestamp: new Date(alert.timestamp).toISOString(),
        context: alert.context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  }
}

/**
 * Email notification channel (stub)
 */
export class EmailChannel implements AlertChannel {
  name = "email";

  constructor(private recipients: string[]) {}

  async send(alert: Alert): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    logger.info("Email alert notification", {
      recipients: this.recipients,
      alert: alert.id,
      title: alert.title,
    });
  }
}

/**
 * Slack notification channel (stub)
 */
export class SlackChannel implements AlertChannel {
  name = "slack";

  constructor(private webhookUrl: string) {}

  async send(alert: Alert): Promise<void> {
    // In production, send to Slack webhook
    const color = {
      info: "#36a64f",
      warning: "#ff9900",
      error: "#ff0000",
      critical: "#990000",
    }[alert.severity];

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: alert.title,
            text: alert.message,
            fields: Object.entries(alert.context ?? {}).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            })),
            footer: "BetAnalytic Alerting",
            ts: Math.floor(alert.timestamp / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  }
}

// Global alert manager instance
export const alertManager = new AlertManager();

/**
 * Predefined alert templates
 */
export const alerts = {
  /**
   * Database connection failure
   */
  databaseDown: (error: Error) =>
    alertManager.createAlert(
      "critical",
      "Database Connection Failed",
      "Unable to connect to the database",
      { error: error.message },
    ),

  /**
   * High error rate
   */
  highErrorRate: (rate: number, threshold: number) =>
    alertManager.createAlert(
      "error",
      "High Error Rate Detected",
      `Error rate (${rate}%) exceeds threshold (${threshold}%)`,
      { rate, threshold },
    ),

  /**
   * Slow response time
   */
  slowResponse: (endpoint: string, duration: number) =>
    alertManager.createAlert(
      "warning",
      "Slow Response Time",
      `Endpoint ${endpoint} took ${duration}ms to respond`,
      { endpoint, duration },
    ),

  /**
   * Memory usage high
   */
  highMemory: (usage: number, limit: number) =>
    alertManager.createAlert(
      "warning",
      "High Memory Usage",
      `Memory usage (${usage}MB) approaching limit (${limit}MB)`,
      { usage, limit },
    ),

  /**
   * API rate limit exceeded
   */
  rateLimitExceeded: (userId: string, endpoint: string) =>
    alertManager.createAlert(
      "warning",
      "Rate Limit Exceeded",
      `User ${userId} exceeded rate limit for ${endpoint}`,
      { userId, endpoint },
    ),

  /**
   * Payment failure
   */
  paymentFailed: (userId: string, error: string) =>
    alertManager.createAlert(
      "error",
      "Payment Processing Failed",
      `Payment failed for user ${userId}: ${error}`,
      { userId, error },
    ),
};
