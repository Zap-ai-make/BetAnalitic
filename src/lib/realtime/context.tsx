'use client'

/**
 * Real-time Context Provider
 * Story 6.1: React Context for real-time messaging
 */

import * as React from 'react'
import { getRealtimeProvider } from './provider'
import type {
  RealtimeProvider,
  ConnectionState,
  ChannelSubscription,
  PresenceData,
  RealtimeMessage,
} from './types'

interface RealtimeContextValue {
  provider: RealtimeProvider
  connectionState: ConnectionState
  isConnected: boolean
}

const RealtimeContext = React.createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [provider] = React.useState(() => getRealtimeProvider())
  const [connectionState, setConnectionState] = React.useState<ConnectionState>('disconnected')

  React.useEffect(() => {
    const unsubscribe = provider.onConnectionStateChange(setConnectionState)
    void provider.connect()

    return () => {
      unsubscribe()
      provider.disconnect()
    }
  }, [provider])

  const value: RealtimeContextValue = {
    provider,
    connectionState,
    isConnected: connectionState === 'connected',
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

/**
 * Hook to access real-time provider
 */
export function useRealtime() {
  const context = React.useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return context
}

/**
 * Hook to subscribe to a channel
 * Auto-subscribes when channelId changes
 * Auto-unsubscribes on unmount
 */
export function useChannel(
  channelId: string | null,
  onMessage: (message: RealtimeMessage) => void,
  onPresenceUpdate?: (members: PresenceData[]) => void
) {
  const { provider } = useRealtime()

  React.useEffect(() => {
    if (!channelId) return

    const subscription: ChannelSubscription = {
      channelId,
      onMessage,
      onPresenceUpdate,
    }

    let unsubscribe: (() => void) | undefined

    void provider.subscribe(subscription).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [channelId, provider, onMessage, onPresenceUpdate])
}

/**
 * Hook to track presence (online users) in a channel
 * Returns array of members with their presence data
 */
export function usePresence(channelId: string | null) {
  const { provider } = useRealtime()
  const [members, setMembers] = React.useState<PresenceData[]>([])

  React.useEffect(() => {
    if (!channelId) return

    void provider.getPresence(channelId).then(setMembers)

    const subscription: ChannelSubscription = {
      channelId,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onMessage: () => {}, // No-op for presence-only subscription
      onPresenceUpdate: setMembers,
    }

    let unsubscribe: (() => void) | undefined

    void provider.subscribe(subscription).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [channelId, provider])

  return members
}

/**
 * Hook to publish messages to a channel
 * Returns a publish function
 */
export function usePublish(channelId: string | null) {
  const { provider } = useRealtime()

  const publish = React.useCallback(
    async (message: Omit<RealtimeMessage, 'id' | 'timestamp' | 'channelId'>) => {
      if (!channelId) {
        console.warn('[usePublish] No channel ID provided')
        return
      }

      await provider.publish(channelId, {
        ...message,
        channelId,
      })
    },
    [channelId, provider]
  )

  return publish
}

/**
 * Hook to manage presence in a channel
 * Auto-enters presence on mount, leaves on unmount
 */
export function useEnterPresence(
  channelId: string | null,
  presenceData: Omit<PresenceData, 'joinedAt'> | null
) {
  const { provider } = useRealtime()

  React.useEffect(() => {
    if (!channelId || !presenceData) return

    const data: PresenceData = {
      ...presenceData,
      joinedAt: new Date(),
    }

    void provider.enterPresence(channelId, data)

    return () => {
      void provider.leavePresence(channelId)
    }
  }, [channelId, provider, presenceData])
}
