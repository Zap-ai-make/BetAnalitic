/**
 * Live Match Hook
 * Story 7.1: Hook for managing live match subscriptions
 */

import * as React from "react"
import { useLiveModeStore } from "~/stores/liveMode"
import { useChannel, usePublish } from "~/lib/realtime/context"
import type { RealtimeMessage } from "~/lib/realtime/types"

interface UseLiveMatchOptions {
  matchId: string
  enabled?: boolean
  onUpdate?: (data: unknown) => void
}

export function useLiveMatch({ matchId, enabled = true, onUpdate }: UseLiveMatchOptions) {
  const { isMatchLive, activateLiveMode, deactivateLiveMode } = useLiveModeStore()
  const isActive = isMatchLive(matchId)

  const publish = usePublish(`live:match:${matchId}`)

  const handleMessage = React.useCallback(
    (msg: RealtimeMessage) => {
      if (msg.type === "LIVE_UPDATE" && onUpdate) {
        onUpdate(msg.payload)
      }
    },
    [onUpdate]
  )

  useChannel(enabled && isActive ? `live:match:${matchId}` : null, handleMessage)

  const activate = React.useCallback(() => {
    activateLiveMode(matchId)
  }, [activateLiveMode, matchId])

  const deactivate = React.useCallback(() => {
    deactivateLiveMode(matchId)
  }, [deactivateLiveMode, matchId])

  const publishUpdate = React.useCallback(
    (payload: unknown) => {
      if (isActive) {
        void publish({
          type: "LIVE_UPDATE",
          userId: "system",
          payload,
        })
      }
    },
    [isActive, publish]
  )

  return {
    isActive,
    activate,
    deactivate,
    publishUpdate,
  }
}
