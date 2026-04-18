/**
 * Epic 12 Story 12.3: Offline Data with Dexie/IndexedDB
 * IndexedDB configuration and database schema
 */

import Dexie, { type Table } from "dexie"

// Define the data types for offline storage
export interface OfflineUser {
  id: string
  name: string | null
  email: string | null
  tier: string
  credits: number
  points: number
  level: number
  syncedAt: number
}

export interface OfflineConversation {
  id: string
  agentId: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: number
  }>
  createdAt: number
  syncedAt: number
}

export interface OfflineAnalysis {
  id: string
  matchId: string
  result: unknown
  createdAt: number
  syncedAt: number
}

export interface OfflineRoom {
  id: string
  name: string
  description: string | null
  category: string | null
  isPrivate: boolean
  maxMembers: number
  memberCount: number
  syncedAt: number
}

export interface PendingAction {
  id: string
  type: "message" | "analysis" | "save" | "update"
  data: unknown
  createdAt: number
  retryCount: number
}

// Define the database schema
export class OfflineDatabase extends Dexie {
  user!: Table<OfflineUser, string>
  conversations!: Table<OfflineConversation, string>
  analyses!: Table<OfflineAnalysis, string>
  rooms!: Table<OfflineRoom, string>
  pendingActions!: Table<PendingAction, string>

  constructor() {
    super("BetAnalyticOfflineDB")

    // Define schema version 1
    this.version(1).stores({
      user: "id, syncedAt",
      conversations: "id, agentId, syncedAt",
      analyses: "id, matchId, createdAt, syncedAt",
      rooms: "id, category, syncedAt",
      pendingActions: "id, type, createdAt",
    })
  }
}

// Create database instance
export const offlineDb = new OfflineDatabase()

// Helper functions
export async function clearAllOfflineData() {
  await offlineDb.user.clear()
  await offlineDb.conversations.clear()
  await offlineDb.analyses.clear()
  await offlineDb.rooms.clear()
}

export async function getLastSyncTime(
  tableName: "user" | "conversations" | "analyses" | "rooms"
): Promise<number | null> {
  const table = offlineDb[tableName]
  const items = await table.orderBy("syncedAt").reverse().limit(1).toArray()
  return items[0]?.syncedAt ?? null
}
