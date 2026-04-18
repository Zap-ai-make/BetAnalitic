"use client"

/**
 * Story 6.8: Real-time Room Chat Hook
 * Integrates with realtime provider for live messaging
 */

import { useState, useEffect, useCallback, useRef } from "react"
import type { RoomMessage, ChannelSubscription } from "./types"
import { getRealtimeProvider } from "./provider"

interface UseRoomChatOptions {
  roomId: string
  userId: string
  userName: string
  userAvatar?: string
  onError?: (error: Error) => void
}

interface UseRoomChatReturn {
  messages: RoomMessage[]
  sendMessage: (content: string, type?: RoomMessage["type"]) => Promise<void>
  isConnected: boolean
  isLoading: boolean
  error: Error | null
}

export function useRoomChat({
  roomId,
  userId,
  userName,
  userAvatar,
  onError,
}: UseRoomChatOptions): UseRoomChatReturn {
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const channelId = `room:${roomId}:chat`

  useEffect(() => {
    const provider = getRealtimeProvider()
    let mounted = true

    async function connect() {
      try {
        setIsLoading(true)
        await provider.connect()

        if (!mounted) return

        const subscription: ChannelSubscription = {
          channelId,
          onMessage: (msg) => {
            if (!mounted) return
            // Skip LIVE_UPDATE messages in room chat
            if (msg.type === "LIVE_UPDATE") return

            const meta = msg.metadata ?? {}
            const roomMessage: RoomMessage = {
              id: msg.id,
              roomId,
              userId: msg.userId,
              userName: (meta.userName as string) ?? "Anonyme",
              userAvatar: meta.userAvatar as string | undefined,
              content: msg.content ?? "",
              type: msg.type === "ROOM_MESSAGE" ? "system" : msg.type,
              createdAt: msg.timestamp,
            }
            setMessages((prev) => [...prev, roomMessage])
          },
        }

        unsubscribeRef.current = await provider.subscribe(subscription)
        setIsConnected(true)
        setIsLoading(false)

        // Enter presence
        await provider.enterPresence(channelId, {
          userId: userId,
          userName: userName,
          userAvatar: userAvatar,
          status: "online",
          joinedAt: new Date(),
        })
      } catch (err) {
        if (!mounted) return
        const error = err instanceof Error ? err : new Error("Connection failed")
        setError(error)
        onError?.(error)
        setIsLoading(false)
      }
    }

    void connect()

    // Connection state listener
    const removeStateListener = provider.onConnectionStateChange((state) => {
      if (!mounted) return
      setIsConnected(state === "connected")
    })

    return () => {
      mounted = false
      unsubscribeRef.current?.()
      removeStateListener()
      void provider.leavePresence(channelId)
    }
  }, [roomId, channelId, userId, userName, userAvatar, onError])

  const sendMessage = useCallback(
    async (content: string, type: RoomMessage["type"] = "text") => {
      const provider = getRealtimeProvider()

      await provider.publish(channelId, {
        channelId,
        userId,
        type,
        content,
        metadata: {
          userName,
          userAvatar,
        },
      })
    },
    [channelId, userId, userName, userAvatar]
  )

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    error,
  }
}
