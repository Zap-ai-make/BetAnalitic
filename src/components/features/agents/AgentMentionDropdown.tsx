"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import type { AgentMetadata } from "~/lib/agents/types"

interface AgentMentionDropdownProps {
  agents: AgentMetadata[]
  selectedIndex: number
  filterText: string
  onSelect: (agent: AgentMetadata) => void
  position?: { top: number; left: number }
}

// Group agents by category
function groupAgentsByCategory(agents: AgentMetadata[]) {
  const groups: Record<string, AgentMetadata[]> = {}

  for (const agent of agents) {
    if (!groups[agent.category]) {
      groups[agent.category] = []
    }
    groups[agent.category]!.push(agent)
  }

  return groups
}

const categoryIcons: Record<string, string> = {
  Data: "📊",
  Analyse: "🔍",
  Marché: "💰",
  Intel: "🎯",
  Live: "⚡",
}

/**
 * Highlight matching characters in text
 */
function HighlightedText({
  text,
  highlight,
}: {
  text: string
  highlight: string
}) {
  if (!highlight) {
    return <span>{text}</span>
  }

  const lowerText = text.toLowerCase()
  const lowerHighlight = highlight.toLowerCase()
  const index = lowerText.indexOf(lowerHighlight)

  if (index === -1) {
    return <span>{text}</span>
  }

  const before = text.slice(0, index)
  const match = text.slice(index, index + highlight.length)
  const after = text.slice(index + highlight.length)

  return (
    <span>
      {before}
      <span className="bg-accent-cyan/30 text-accent-cyan font-bold">
        {match}
      </span>
      {after}
    </span>
  )
}

/**
 * Agent tooltip with expertise and examples
 */
function AgentTooltip({ agent }: { agent: AgentMetadata }) {
  return (
    <div className="absolute left-full top-0 ml-2 w-64 p-3 bg-bg-primary border border-bg-tertiary rounded-lg shadow-xl z-60 animate-in fade-in-0 slide-in-from-left-2 duration-150">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{agent.emoji}</span>
        <span className="font-display font-semibold text-text-primary">
          {agent.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-3">{agent.description}</p>

      {/* Expertise */}
      {agent.expertise && agent.expertise.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-text-tertiary uppercase mb-1">
            Expertise
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.expertise.map((exp, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-bg-tertiary rounded-full text-text-secondary"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {agent.examples && agent.examples.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase mb-1">
            Exemples
          </div>
          <ul className="space-y-1">
            {agent.examples.map((example, i) => (
              <li
                key={i}
                className="text-xs text-accent-cyan italic before:content-['→_'] before:text-text-tertiary"
              >
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function AgentMentionDropdown({
  agents,
  selectedIndex,
  filterText,
  onSelect,
  position,
}: AgentMentionDropdownProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const selectedRef = React.useRef<HTMLButtonElement>(null)
  const [hoveredAgent, setHoveredAgent] = React.useState<AgentMetadata | null>(
    null
  )
  const hoverTimeout = React.useRef<NodeJS.Timeout>()

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [selectedIndex])

  const grouped = groupAgentsByCategory(agents)
  const categories = Object.keys(grouped).sort()

  // Calculate flat index for keyboard navigation
  let flatIndex = 0

  const handleMouseEnter = (agent: AgentMetadata) => {
    // Delay tooltip display for desktop hover
    hoverTimeout.current = setTimeout(() => {
      setHoveredAgent(agent)
    }, 300)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
    setHoveredAgent(null)
  }

  // Long press for mobile
  const handleTouchStart = (agent: AgentMetadata) => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredAgent(agent)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-50 w-80 max-h-96 overflow-y-auto",
        "bg-bg-secondary border border-bg-tertiary rounded-lg shadow-2xl",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200"
      )}
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      {categories.length === 0 ? (
        <div className="p-4 text-center text-text-secondary text-sm">
          Aucun agent trouvé
        </div>
      ) : (
        categories.map((category) => (
          <div key={category}>
            {/* Category Header */}
            <div className="sticky top-0 z-10 px-3 py-2 bg-bg-tertiary">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {categoryIcons[category] ?? "📌"} {category}
              </span>
            </div>

            {/* Agents in Category */}
            {grouped[category]!.map((agent) => {
              const isSelected = flatIndex === selectedIndex
              const isHovered = hoveredAgent?.id === agent.id
              flatIndex++

              return (
                <div key={agent.id} className="relative">
                  <button
                    ref={isSelected ? selectedRef : undefined}
                    onClick={() => onSelect(agent)}
                    onMouseEnter={() => handleMouseEnter(agent)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => handleTouchStart(agent)}
                    onTouchEnd={handleTouchEnd}
                    className={cn(
                      "w-full px-3 py-2 flex items-center gap-3",
                      "text-left transition-colors",
                      "min-h-[48px]", // Touch target
                      isSelected
                        ? "bg-accent-cyan/20 border-l-2 border-accent-cyan"
                        : "hover:bg-bg-tertiary border-l-2 border-transparent"
                    )}
                  >
                    {/* Agent Avatar/Emoji */}
                    <span className="text-2xl flex-shrink-0">{agent.emoji}</span>

                    {/* Agent Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-text-primary">
                        <HighlightedText
                          text={agent.name}
                          highlight={filterText}
                        />
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {agent.description}
                      </div>
                    </div>

                    {/* Color Indicator */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />
                  </button>

                  {/* Tooltip on hover/long-press */}
                  {isHovered && <AgentTooltip agent={agent} />}
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
