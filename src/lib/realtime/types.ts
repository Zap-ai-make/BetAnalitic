/**
 * Real-time Provider Types
 * Story 6.1: Abstraction layer for real-time messaging
 */

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "suspended"
  | "failed"

export interface PresenceData {
  userId: string
  userName: string
  userAvatar?: string
  status: "online" | "away" | "busy"
  joinedAt: Date
}

export interface RealtimeMessage {
  id: string
  channelId: string
  userId: string
  type: "text" | "agent" | "system" | "ROOM_MESSAGE"
  content?: string
  payload?: unknown
  metadata?: Record<string, unknown>
  timestamp: Date
}

export interface ChannelSubscription {
  channelId: string
  onMessage: (message: RealtimeMessage) => void
  onPresenceUpdate?: (members: PresenceData[]) => void
}

export interface RealtimeProvider {
  // Connection
  connect(): Promise<void>
  disconnect(): void
  getConnectionState(): ConnectionState
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void

  // Channels
  subscribe(subscription: ChannelSubscription): Promise<() => void>
  unsubscribe(channelId: string): void

  // Messaging
  publish(channelId: string, message: Omit<RealtimeMessage, "id" | "timestamp">): Promise<void>

  // Presence
  enterPresence(channelId: string, data: PresenceData): Promise<void>
  leavePresence(channelId: string): Promise<void>
  getPresence(channelId: string): Promise<PresenceData[]>
}

// Room types
export type RoomType = "official" | "private"
export type RoomVisibility = "public" | "private" | "invite-only"
export type MemberRole = "owner" | "admin" | "member"

export interface Room {
  id: string
  name: string
  description?: string
  color: string
  badge?: string
  type: RoomType
  visibility: RoomVisibility
  ownerId: string
  maxMembers: number
  memberCount: number
  onlineCount: number
  matchId?: string
  settings: RoomSettings
  createdAt: Date
  archivedAt?: Date
}

export interface RoomSettings {
  membersCanInvite: boolean
  membersCanInvokeAgents: boolean
  dataOnlyMode: boolean
}

export interface RoomMember {
  userId: string
  userName: string
  userAvatar?: string
  role: MemberRole
  joinedAt: Date
  isOnline: boolean
}

export interface RoomMessage {
  id: string
  roomId: string
  userId: string
  userName: string
  userAvatar?: string
  type: "text" | "agent" | "system"
  content: string
  agentId?: string
  replyToId?: string
  reactions?: Record<string, string[]>
  createdAt: Date
  editedAt?: Date
  isDeleted?: boolean
}

export interface RoomTicket {
  id: string
  roomId: string
  userId: string
  status: "active" | "won" | "lost" | "archived"
  matches: Array<{
    matchId: string
    homeTeam: string
    awayTeam: string
    selection: string
    odds: number
  }>
  totalOdds: number
  createdAt: Date
}
