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
 * In production, replace with Ably implementation
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
    const existingIndex = members.findIndex((m) => m.odifier === data.odifier)

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

// Provider factory
let _provider: RealtimeProvider | null = null

export function getRealtimeProvider(): RealtimeProvider {
  if (!_provider) {
    // Use mock provider - in production, integrate Ably SDK
    // Install ably: pnpm add ably
    // Then implement AblyRealtimeProvider
    _provider = new MockRealtimeProvider()
  }

  return _provider
}
