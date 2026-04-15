"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export type AgentId =
  | "scout"
  | "insider"
  | "referee"
  | "tactic"
  | "context"
  | "momentum"
  | "wall"
  | "goal"
  | "corner"
  | "card"
  | "crowd"
  | "live"
  | "debate"
  | "debrief"

export interface Agent {
  id: AgentId
  name: string
  shortName: string
  avatar: string
}

export const AGENTS: Agent[] = [
  { id: "scout", name: "Scout", shortName: "Scout", avatar: "🔍" },
  { id: "insider", name: "Insider", shortName: "Insider", avatar: "🕵️" },
  { id: "referee", name: "RefereeAnalyst", shortName: "Referee", avatar: "⚖️" },
  { id: "tactic", name: "TacticMaster", shortName: "Tactic", avatar: "🎯" },
  { id: "context", name: "ContextKing", shortName: "Context", avatar: "👑" },
  { id: "momentum", name: "MomentumX", shortName: "Momentum", avatar: "📈" },
  { id: "wall", name: "WallMaster", shortName: "Wall", avatar: "🧱" },
  { id: "goal", name: "GoalMaster", shortName: "Goal", avatar: "⚽" },
  { id: "corner", name: "CornerKing", shortName: "Corner", avatar: "🚩" },
  { id: "card", name: "CardShark", shortName: "Card", avatar: "🃏" },
  { id: "crowd", name: "CrowdWatch", shortName: "Crowd", avatar: "👥" },
  { id: "live", name: "LivePulse", shortName: "Live", avatar: "💓" },
  { id: "debate", name: "DebateArena", shortName: "Debate", avatar: "⚔️" },
  { id: "debrief", name: "Debrief", shortName: "Debrief", avatar: "📋" },
]

export interface AgentPillProps {
  agent: Agent
  selected?: boolean
  onClick?: () => void
}

export function AgentPill({ agent, selected, onClick }: AgentPillProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
        "bg-bg-secondary border-2 whitespace-nowrap",
        "min-h-[44px] min-w-[44px]",
        "hover:border-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary",
        selected && "border-current",
        !selected && "border-transparent hover:border-current/50"
      )}
      style={{
        color: `var(--color-agent-${agent.id})`,
        ["--tw-ring-color" as string]: `var(--color-agent-${agent.id})`,
      }}
      onClick={onClick}
    >
      <span
        className="flex items-center justify-center w-8 h-8 rounded-full text-lg"
        style={{ backgroundColor: `var(--color-agent-${agent.id})20` }}
      >
        {agent.avatar}
      </span>
      <span className="font-display font-semibold text-sm text-text-primary">
        {agent.shortName}
      </span>
    </button>
  )
}

export interface AgentPillRowProps {
  agents?: Agent[]
  selectedAgentId?: AgentId | null
  onAgentSelect?: (agent: Agent) => void
}

export function AgentPillRow({
  agents = AGENTS,
  selectedAgentId,
  onAgentSelect,
}: AgentPillRowProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          "flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1",
          "-mx-1"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {agents.map((agent) => (
          <AgentPill
            key={agent.id}
            agent={agent}
            selected={selectedAgentId === agent.id}
            onClick={() => onAgentSelect?.(agent)}
          />
        ))}
      </div>
    </div>
  )
}
