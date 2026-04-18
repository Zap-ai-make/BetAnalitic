/**
 * Live Alerts Hook
 * Story 7.4: Hook for managing live agent alerts
 */

import * as React from "react"
import { useChannel } from "~/lib/realtime/context"
import type { RealtimeMessage } from "~/lib/realtime/types"

export interface LiveAlert {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  message: string
  fullContent?: string
  timestamp: Date
}

interface UseLiveAlertsOptions {
  matchId: string
  enabled?: boolean
}

export function useLiveAlerts({ matchId, enabled = true }: UseLiveAlertsOptions) {
  const [alerts, setAlerts] = React.useState<LiveAlert[]>([])
  const [currentAlert, setCurrentAlert] = React.useState<LiveAlert | null>(null)

  const handleMessage = React.useCallback((msg: RealtimeMessage) => {
    if (msg.type === "agent" && msg.payload) {
      const alert: LiveAlert = {
        id: msg.id,
        agentId: msg.metadata?.agentId as string,
        agentName: msg.metadata?.agentName as string ?? "Agent",
        agentColor: msg.metadata?.agentColor as string ?? "#00D9FF",
        message: msg.content ?? "",
        fullContent: msg.metadata?.fullContent as string | undefined,
        timestamp: msg.timestamp,
      }

      setAlerts((prev) => [alert, ...prev].slice(0, 20))
      setCurrentAlert(alert)
    }
  }, [])

  useChannel(enabled ? `live:match:${matchId}` : null, handleMessage)

  const dismissAlert = React.useCallback(() => {
    setCurrentAlert(null)
  }, [])

  const clearAlerts = React.useCallback(() => {
    setAlerts([])
    setCurrentAlert(null)
  }, [])

  return {
    alerts,
    currentAlert,
    dismissAlert,
    clearAlerts,
  }
}
