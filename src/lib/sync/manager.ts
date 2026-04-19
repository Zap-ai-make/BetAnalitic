/**
 * Epic 12 Story 12.4: Background Sync & Queue
 * Manages offline action queue and background synchronization
 */

import { offlineDb, type PendingAction } from "~/lib/db/offline"

export interface SyncResult {
  success: boolean
  error?: string
  conflictData?: unknown
}

class BackgroundSyncManager {
  private isSyncing = false
  private maxRetries = 5

  /**
   * Queue an action for later sync
   */
  async queueAction(
    type: PendingAction["type"],
    data: unknown
  ): Promise<string> {
    const action: PendingAction = {
      id: crypto.randomUUID(),
      type,
      data,
      createdAt: Date.now(),
      retryCount: 0,
    }

    await offlineDb.pendingActions.add(action)
    return action.id
  }

  /**
   * Process all pending actions
   */
  async syncPendingActions(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return
    }

    this.isSyncing = true

    try {
      const pending = await offlineDb.pendingActions.orderBy("createdAt").toArray()

      for (const action of pending) {
        await this.processAction(action)
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Process a single pending action
   */
  private async processAction(action: PendingAction): Promise<void> {
    try {
      const result = await this.executeAction(action)

      if (result.success) {
        // Remove from queue on success
        await offlineDb.pendingActions.delete(action.id)
      } else if (result.conflictData) {
        // Handle conflict - for now, just log it
        console.warn("Sync conflict detected:", result.conflictData)
        // In a real app, you'd show a conflict resolution UI
        await offlineDb.pendingActions.delete(action.id)
      } else {
        // Retry with exponential backoff
        await this.retryAction(action)
      }
    } catch (error) {
      console.error("Error processing action:", error)
      await this.retryAction(action)
    }
  }

  /**
   * Execute an action (send to server)
   */
  private async executeAction(_action: PendingAction): Promise<SyncResult> {
    // This is a placeholder - in real implementation, you'd call your tRPC endpoints
    // based on the action type

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 100))

      // For demo purposes, assume success
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Retry an action with exponential backoff
   */
  private async retryAction(action: PendingAction): Promise<void> {
    const newRetryCount = action.retryCount + 1

    if (newRetryCount >= this.maxRetries) {
      // Max retries reached, remove from queue
      await offlineDb.pendingActions.delete(action.id)
      console.error("Max retries reached for action:", action.id)
      return
    }

    // Update retry count
    await offlineDb.pendingActions.update(action.id, {
      retryCount: newRetryCount,
    })

    // Schedule retry with exponential backoff
    const delay = Math.pow(2, newRetryCount) * 1000 // 2s, 4s, 8s, 16s, 32s
    setTimeout(() => {
      void this.processAction(action)
    }, delay)
  }

  /**
   * Get pending actions count
   */
  async getPendingCount(): Promise<number> {
    return await offlineDb.pendingActions.count()
  }

  /**
   * Clear all pending actions
   */
  async clearPending(): Promise<void> {
    await offlineDb.pendingActions.clear()
  }
}

// Export singleton instance
export const syncManager = new BackgroundSyncManager()

// Auto-sync when coming online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void syncManager.syncPendingActions()
  })
}
