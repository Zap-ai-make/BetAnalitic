/**
 * Push Notifications Manager
 * Story 7.6: Push notification support for Live Mode alerts
 */

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null

  async initialize() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported")
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error("Failed to initialize push manager:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    return await Notification.requestPermission()
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      return null
    }

    try {
      const permission = await this.requestPermission()
      if (permission !== "granted") {
        return null
      }

      // Get existing subscription or create new one
      let subscription = await this.registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
      }

      return subscription
    } catch (error) {
      console.error("Failed to subscribe to push:", error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to unsubscribe from push:", error)
      return false
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      return false
    }

    try {
      const permission = Notification.permission
      if (permission !== "granted") {
        return false
      }

      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon ?? "/icon-192x192.png",
        badge: payload.badge ?? "/badge-72x72.png",
        tag: payload.tag,
        data: payload.data,
        requireInteraction: false,
      } as NotificationOptions)

      return true
    } catch (error) {
      console.error("Failed to send notification:", error)
      return false
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (!("Notification" in window)) {
      return "denied"
    }
    return Notification.permission
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window &&
      "PushManager" in window
    )
  }
}

export const pushManager = new PushNotificationManager()
