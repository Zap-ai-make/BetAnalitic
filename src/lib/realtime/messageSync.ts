/**
 * Story 6.10: Message Sync
 * Handles offline queue and reconnection sync
 */

import type { RoomMessage } from "./types"

interface QueuedMessage {
  id: string
  roomId: string
  content: string
  type: RoomMessage["type"]
  queuedAt: Date
  retries: number
}

interface MessageSyncState {
  pendingMessages: QueuedMessage[]
  lastSyncTimestamp: Date | null
}

const MAX_RETRIES = 3
const STORAGE_KEY = "room_message_queue"

class MessageSyncManager {
  private state: MessageSyncState = {
    pendingMessages: [],
    lastSyncTimestamp: null,
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.state = {
          pendingMessages: parsed.pendingMessages.map((m: QueuedMessage) => ({
            ...m,
            queuedAt: new Date(m.queuedAt),
          })),
          lastSyncTimestamp: parsed.lastSyncTimestamp
            ? new Date(parsed.lastSyncTimestamp)
            : null,
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Queue a message for sending when offline
   */
  queueMessage(
    roomId: string,
    content: string,
    type: RoomMessage["type"] = "text"
  ): QueuedMessage {
    const message: QueuedMessage = {
      id: `queued-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roomId,
      content,
      type,
      queuedAt: new Date(),
      retries: 0,
    }

    this.state.pendingMessages.push(message)
    this.saveToStorage()

    return message
  }

  /**
   * Get all pending messages for a room
   */
  getPendingMessages(roomId: string): QueuedMessage[] {
    return this.state.pendingMessages.filter((m) => m.roomId === roomId)
  }

  /**
   * Mark a message as successfully sent
   */
  markSent(messageId: string): void {
    this.state.pendingMessages = this.state.pendingMessages.filter(
      (m) => m.id !== messageId
    )
    this.saveToStorage()
  }

  /**
   * Increment retry count for a failed message
   */
  markRetry(messageId: string): boolean {
    const message = this.state.pendingMessages.find((m) => m.id === messageId)
    if (!message) return false

    message.retries++

    if (message.retries >= MAX_RETRIES) {
      // Remove after max retries
      this.state.pendingMessages = this.state.pendingMessages.filter(
        (m) => m.id !== messageId
      )
      this.saveToStorage()
      return false
    }

    this.saveToStorage()
    return true
  }

  /**
   * Process all pending messages with a send function
   */
  async processPendingMessages(
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    // Process in order
    const pending = [...this.state.pendingMessages]

    for (const message of pending) {
      try {
        const success = await sendFn(message)
        if (success) {
          this.markSent(message.id)
          sent++
        } else {
          const canRetry = this.markRetry(message.id)
          if (!canRetry) failed++
        }
      } catch {
        const canRetry = this.markRetry(message.id)
        if (!canRetry) failed++
      }
    }

    return { sent, failed }
  }

  /**
   * Update last sync timestamp
   */
  updateSyncTimestamp(): void {
    this.state.lastSyncTimestamp = new Date()
    this.saveToStorage()
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(): Date | null {
    return this.state.lastSyncTimestamp
  }

  /**
   * Clear all pending messages
   */
  clearPending(): void {
    this.state.pendingMessages = []
    this.saveToStorage()
  }
}

// Singleton instance
let _syncManager: MessageSyncManager | null = null

export function getMessageSyncManager(): MessageSyncManager {
  if (!_syncManager) {
    _syncManager = new MessageSyncManager()
  }
  return _syncManager
}

export type { QueuedMessage, MessageSyncState }
