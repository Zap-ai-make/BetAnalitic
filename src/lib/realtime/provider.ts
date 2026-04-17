/**
 * Real-time Provider Implementation
 * Story 6.1: Ably integration with abstraction layer
 */

import type {
  RealtimeProvider,
  ConnectionState,
  ChannelSubscription,
  RealtimeMessage,
  PresenceData,
} from "./types"

/**
 * Mock Real-time Provider for development
 * Used when NEXT_PUBLIC_ABLY_KEY is not set
 */
export class MockRealtimeProvider implements RealtimeProvider {
  private connectionState: ConnectionState = "disconnected"
  private stateCallbacks = new Set<(state: ConnectionState) => void>()
  private subscriptions = new Map<string, ChannelSubscription>()
  private presence = new Map<string, PresenceData[]>()

  async connect(): Promise<void> {
    this.setConnectionState("connecting")
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.setConnectionState("connected")
  }

  disconnect(): void {
    this.setConnectionState("disconnected")
    this.subscriptions.clear()
    this.presence.clear()
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.stateCallbacks.add(callback)
    return () => this.stateCallbacks.delete(callback)
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state
    this.stateCallbacks.forEach((cb) => cb(state))
  }

  async subscribe(subscription: ChannelSubscription): Promise<() => void> {
    this.subscriptions.set(subscription.channelId, subscription)

    return () => {
      this.subscriptions.delete(subscription.channelId)
    }
  }

  unsubscribe(channelId: string): void {
    this.subscriptions.delete(channelId)
  }

  async publish(
    channelId: string,
    message: Omit<RealtimeMessage, "id" | "timestamp">
  ): Promise<void> {
    const subscription = this.subscriptions.get(channelId)
    if (subscription) {
      const fullMessage: RealtimeMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
      }
      subscription.onMessage(fullMessage)
    }
  }

  async enterPresence(channelId: string, data: PresenceData): Promise<void> {
    const members = this.presence.get(channelId) ?? []
    const existingIndex = members.findIndex((m) => m.userId === data.userId)

    if (existingIndex >= 0) {
      members[existingIndex] = data
    } else {
      members.push(data)
    }

    this.presence.set(channelId, members)

    const subscription = this.subscriptions.get(channelId)
    subscription?.onPresenceUpdate?.(members)
  }

  async leavePresence(channelId: string): Promise<void> {
    // In real implementation, would remove current user from presence
    const subscription = this.subscriptions.get(channelId)
    const members = this.presence.get(channelId) ?? []
    subscription?.onPresenceUpdate?.(members)
  }

  async getPresence(channelId: string): Promise<PresenceData[]> {
    return this.presence.get(channelId) ?? []
  }
}

/**
 * Ably Real-time Provider for production
 * Requires: pnpm add ably
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
export class AblyRealtimeProvider implements RealtimeProvider {
  private client: any // Ably.Realtime - using any to avoid requiring ably dependency
  private channels = new Map<string, any>()

  constructor(apiKey: string) {
    // Lazy import to avoid requiring ably in development
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Ably = require("ably")
      this.client = new Ably.Realtime({
        key: apiKey,
        autoConnect: true,
        echoMessages: false,
        recover: true,
        transports: ["web_socket", "xhr_streaming"],
      })
    } catch (error) {
      throw new Error(
        "Ably SDK not installed. Run: pnpm add ably"
      )
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client.connection.state === "connected") {
        resolve()
        return
      }

      this.client.connection.once("connected", () => resolve())
      this.client.connection.once("failed", (error: Error) => reject(error))
      this.client.connect()
    })
  }

  disconnect(): void {
    this.channels.forEach((channel: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      channel.detach()
    })
    this.channels.clear()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.client.close()
  }

  getConnectionState(): ConnectionState {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const state = this.client.connection.state as string
    return state as ConnectionState
  }

  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    const listener = (stateChange: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      callback(stateChange.current as ConnectionState)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.client.connection.on(listener)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.client.connection.off(listener)
    }
  }

  async subscribe(subscription: ChannelSubscription): Promise<() => void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const channel = this.client.channels.get(subscription.channelId)
    this.channels.set(subscription.channelId, channel)

    // Subscribe to messages
    const messageListener = (message: any) => {
      const realtimeMessage: RealtimeMessage = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: message.id ?? `msg-${Date.now()}`,
        channelId: subscription.channelId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userId: message.clientId ?? "anonymous",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        type: (message.data.type as RealtimeMessage["type"]) ?? "text",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        content: message.data.content,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metadata: message.data.metadata,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        timestamp: new Date(message.timestamp),
      }
      subscription.onMessage(realtimeMessage)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await channel.subscribe(messageListener)

    // Subscribe to presence if callback provided
    if (subscription.onPresenceUpdate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await channel.presence.subscribe((presenceMessage: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        void channel.presence.get().then((members: any[]) => {
          const presenceData: PresenceData[] = members.map((m) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            userId: m.clientId ?? "anonymous",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            userName: (m.data?.userName as string) ?? "Unknown",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            userAvatar: m.data?.userAvatar as string | undefined,
            status: "online" as const,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            joinedAt: new Date(m.timestamp),
          }))
          subscription.onPresenceUpdate!(presenceData)
        })
      })
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      channel.unsubscribe(messageListener)
      this.channels.delete(subscription.channelId)
    }
  }

  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId)
    if (channel) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      channel.detach()
      this.channels.delete(channelId)
    }
  }

  async publish(
    channelId: string,
    message: Omit<RealtimeMessage, "id" | "timestamp">
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.channels.get(channelId) ?? this.client.channels.get(channelId)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await channel.publish({
      name: message.type,
      data: {
        type: message.type,
        content: message.content,
        metadata: message.metadata,
      },
      clientId: message.userId,
    })
  }

  async enterPresence(channelId: string, data: PresenceData): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.channels.get(channelId) ?? this.client.channels.get(channelId)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await channel.presence.enter({
      userName: data.userName,
      userAvatar: data.userAvatar,
      status: data.status,
    })
  }

  async leavePresence(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (channel) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await channel.presence.leave()
    }
  }

  async getPresence(channelId: string): Promise<PresenceData[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.channels.get(channelId) ?? this.client.channels.get(channelId)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const members: any[] = await channel.presence.get()

    return members.map((m) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: m.clientId ?? "anonymous",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userName: (m.data?.userName as string) ?? "Unknown",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userAvatar: m.data?.userAvatar as string | undefined,
      status: "online" as const,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      joinedAt: new Date(m.timestamp),
    }))
  }
}

// Provider factory
let _provider: RealtimeProvider | null = null

/**
 * Get or create the real-time provider
 * Uses Ably in production if NEXT_PUBLIC_ABLY_KEY is set
 * Falls back to Mock provider for development
 */
export function getRealtimeProvider(): RealtimeProvider {
  if (!_provider) {
    const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY

    if (ablyKey && typeof window !== "undefined") {
      try {
        _provider = new AblyRealtimeProvider(ablyKey)
        console.log("[Realtime] Using Ably provider")
      } catch (error) {
        console.warn("[Realtime] Ably SDK not found, falling back to Mock provider")
        console.warn("[Realtime] Run: pnpm add ably")
        _provider = new MockRealtimeProvider()
      }
    } else {
      console.log("[Realtime] Using Mock provider (no Ably key found)")
      _provider = new MockRealtimeProvider()
    }
  }

  return _provider
}
