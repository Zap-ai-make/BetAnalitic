import { useState, useEffect, useCallback, useRef } from "react"
import { getAgentRegistry } from "~/lib/agents/registry"
import type { AgentMetadata } from "~/lib/agents/types"

interface MentionState {
  isOpen: boolean
  filterText: string
  cursorPosition: number
  matchStart: number
}

interface UseAgentMentionReturn {
  isOpen: boolean
  filteredAgents: AgentMetadata[]
  selectedIndex: number
  filterText: string
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleInput: (value: string, selectionStart: number) => void
  selectAgent: (agent: AgentMetadata) => void
  closeDropdown: () => void
}

export function useAgentMention(
  onSelect: (agent: AgentMetadata) => void
): UseAgentMentionReturn {
  const [mentionState, setMentionState] = useState<MentionState>({
    isOpen: false,
    filterText: "",
    cursorPosition: 0,
    matchStart: -1,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Get all enabled agents
  const allAgents = getAgentRegistry().getEnabled()

  // Filter agents based on filter text
  const filteredAgents = mentionState.filterText
    ? allAgents.filter((agent) =>
        agent.name.toLowerCase().includes(mentionState.filterText.toLowerCase())
      )
    : allAgents

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [mentionState.filterText])

  /**
   * Select an agent from the dropdown
   */
  const selectAgent = useCallback(
    (agent: AgentMetadata) => {
      onSelect(agent)
      setMentionState({
        isOpen: false,
        filterText: "",
        cursorPosition: 0,
        matchStart: -1,
      })
      setSelectedIndex(0)
    },
    [onSelect]
  )

  /**
   * Close the dropdown
   */
  const closeDropdown = useCallback(() => {
    setMentionState((prev) => ({ ...prev, isOpen: false }))
    setSelectedIndex(0)
  }, [])

  /**
   * Handle input changes to detect @ mentions
   */
  const handleInput = useCallback((value: string, selectionStart: number) => {
    // Clear previous debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      // Find @ symbol before cursor
      const textBeforeCursor = value.substring(0, selectionStart)
      const lastAtIndex = textBeforeCursor.lastIndexOf("@")

      // Check if @ is found and there's no space after it
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)

        // Only open dropdown if no space after @
        if (!textAfterAt.includes(" ")) {
          setMentionState({
            isOpen: true,
            filterText: textAfterAt,
            cursorPosition: selectionStart,
            matchStart: lastAtIndex,
          })
          return
        }
      }

      // Close dropdown if conditions not met
      setMentionState((prev) => ({ ...prev, isOpen: false }))
    }, 100)
  }, [])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!mentionState.isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredAgents.length - 1 ? prev + 1 : 0
          )
          break

        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredAgents.length - 1
          )
          break

        case "Enter":
        case "Tab": {
          const agent = filteredAgents[selectedIndex]
          if (agent) {
            e.preventDefault()
            selectAgent(agent)
          }
          break
        }

        case "Escape":
          e.preventDefault()
          closeDropdown()
          break
      }
    },
    [mentionState.isOpen, filteredAgents, selectedIndex, selectAgent, closeDropdown]
  )

  return {
    isOpen: mentionState.isOpen,
    filteredAgents,
    selectedIndex,
    filterText: mentionState.filterText,
    handleKeyDown,
    handleInput,
    selectAgent,
    closeDropdown,
  }
}
