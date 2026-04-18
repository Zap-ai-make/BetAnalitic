/**
 * DebateArena Store
 * Story 8.1-8.5: Manage debate state and progression
 */

import { create } from "zustand"

export type DebateStatus =
  | "idle"
  | "selecting"
  | "confirming"
  | "in-progress"
  | "verdict"
  | "completed"

export interface DebateMessage {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  content: string
  side: "left" | "right"
  timestamp: Date
}

export interface DebateSession {
  id: string
  matchId: string
  matchLabel: string
  agent1: {
    id: string
    name: string
    color: string
  }
  agent2: {
    id: string
    name: string
    color: string
  }
  topic: string
  messages: DebateMessage[]
  status: DebateStatus
  verdict?: {
    winner: string
    agent1Score: number
    agent2Score: number
    summary: string
  }
  startedAt?: Date
  completedAt?: Date
}

interface DebateArenaState {
  currentDebate: DebateSession | null
  debateHistory: DebateSession[]
  isDebating: boolean

  // Actions
  startDebate: (session: DebateSession) => void
  addMessage: (message: DebateMessage) => void
  updateStatus: (status: DebateStatus) => void
  setVerdict: (verdict: DebateSession["verdict"]) => void
  endDebate: () => void
  clearDebate: () => void
}

export const useDebateArenaStore = create<DebateArenaState>((set) => ({
  currentDebate: null,
  debateHistory: [],
  isDebating: false,

  startDebate: (session) =>
    set({
      currentDebate: { ...session, startedAt: new Date() },
      isDebating: true,
    }),

  addMessage: (message) =>
    set((state) => {
      if (!state.currentDebate) return state
      return {
        currentDebate: {
          ...state.currentDebate,
          messages: [...state.currentDebate.messages, message],
        },
      }
    }),

  updateStatus: (status) =>
    set((state) => {
      if (!state.currentDebate) return state
      return {
        currentDebate: {
          ...state.currentDebate,
          status,
        },
      }
    }),

  setVerdict: (verdict) =>
    set((state) => {
      if (!state.currentDebate) return state
      return {
        currentDebate: {
          ...state.currentDebate,
          verdict,
          status: "verdict",
        },
      }
    }),

  endDebate: () =>
    set((state) => {
      if (!state.currentDebate) return state
      const completedDebate = {
        ...state.currentDebate,
        status: "completed" as const,
        completedAt: new Date(),
      }
      return {
        currentDebate: null,
        isDebating: false,
        debateHistory: [completedDebate, ...state.debateHistory].slice(0, 10),
      }
    }),

  clearDebate: () =>
    set({
      currentDebate: null,
      isDebating: false,
    }),
}))
