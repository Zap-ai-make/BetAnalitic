/**
 * Push Notifications Hook
 * Story 7.6: React hook for managing push notification permissions and subscriptions
 */

import * as React from "react"
import { pushManager } from "~/lib/notifications/pushManager"

export function usePushNotifications() {
  const [permission, setPermission] = React.useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = React.useState(false)
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  React.useEffect(() => {
    setIsSupported(pushManager.isSupported())
    setPermission(pushManager.getPermissionStatus())
  }, [])

  const requestPermission = React.useCallback(async () => {
    const result = await pushManager.requestPermission()
    setPermission(result)
    return result
  }, [])

  const subscribe = React.useCallback(async () => {
    const subscription = await pushManager.subscribe()
    setIsSubscribed(!!subscription)
    if (subscription) {
      setPermission("granted")
    }
    return subscription
  }, [])

  const unsubscribe = React.useCallback(async () => {
    const success = await pushManager.unsubscribe()
    if (success) {
      setIsSubscribed(false)
    }
    return success
  }, [])

  const sendNotification = React.useCallback(
    async (title: string, body: string, data?: Record<string, unknown>) => {
      return await pushManager.sendNotification({
        title,
        body,
        data,
      })
    },
    []
  )

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
  }
}
