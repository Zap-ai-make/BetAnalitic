"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { getAgentRegistry } from "~/lib/agents/registry"
import type { AgentMetadata } from "~/lib/agents/types"
import { AgentMentionDropdown } from "../agents/AgentMentionDropdown"

export interface AgentInvokeInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string, mentionedAgent?: AgentMetadata) => void
  placeholder?: string
  disabled?: boolean
}

export function AgentInvokeInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Tapez @ pour invoquer un agent...",
  disabled,
}: AgentInvokeInputProps) {
  const [showAutocomplete, setShowAutocomplete] = React.useState(false)
  const [autocompleteFilter, setAutocompleteFilter] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  // Get agents from registry
  const allAgents = getAgentRegistry().getEnabled()

  const filteredAgents = React.useMemo(() => {
    if (!autocompleteFilter) return allAgents
    const filter = autocompleteFilter.toLowerCase()
    return allAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(filter) ||
        agent.id.includes(filter)
    )
  }, [autocompleteFilter, allAgents])

  const detectMention = (text: string, cursor: number) => {
    const beforeCursor = text.slice(0, cursor)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      setShowAutocomplete(true)
      setAutocompleteFilter(mentionMatch[1] ?? "")
      setSelectedIndex(0)
    } else {
      setShowAutocomplete(false)
      setAutocompleteFilter("")
    }
  }

  const insertAgent = (agent: AgentMetadata) => {
    const beforeCursor = value.slice(0, cursorPosition)
    const afterCursor = value.slice(cursorPosition)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const startPos = cursorPosition - mentionMatch[0].length
      // Use kebab-case id for mention
      const newValue =
        value.slice(0, startPos) + `@${agent.id} ` + afterCursor
      onChange(newValue)

      setTimeout(() => {
        const newCursorPos = startPos + agent.id.length + 2
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
        inputRef.current?.focus()
      }, 0)
    }

    setShowAutocomplete(false)
    setAutocompleteFilter("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete && filteredAgents.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredAgents.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredAgents.length - 1
        )
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const agent = filteredAgents[selectedIndex]
        if (agent) insertAgent(agent)
      } else if (e.key === "Escape") {
        setShowAutocomplete(false)
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const mentionMatch = value.match(/@([\w-]+)/)
      let mentionedAgent: AgentMetadata | undefined
      if (mentionMatch?.[1]) {
        const matchText = mentionMatch[1].toLowerCase()
        mentionedAgent = allAgents.find(
          (a) => a.id === matchText || a.name.toLowerCase() === matchText
        )
      }
      onSubmit?.(value, mentionedAgent)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursor = e.target.selectionStart ?? 0
    onChange(newValue)
    setCursorPosition(cursor)
    detectMention(newValue, cursor)
  }

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const cursor = (e.target as HTMLTextAreaElement).selectionStart ?? 0
    setCursorPosition(cursor)
    detectMention(value, cursor)
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          "w-full bg-bg-secondary rounded-lg px-4 py-3 resize-none",
          "font-body text-base text-text-primary placeholder:text-text-tertiary",
          "border-2 border-transparent transition-all duration-200",
          "focus:outline-none focus:border-accent-cyan/50",
          "min-h-[44px]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />

      {/* Autocomplete Dropdown with highlight and tooltip */}
      {showAutocomplete && filteredAgents.length > 0 && (
        <div className="absolute left-0 right-0 bottom-full mb-2 z-50">
          <AgentMentionDropdown
            agents={filteredAgents}
            selectedIndex={selectedIndex}
            filterText={autocompleteFilter}
            onSelect={insertAgent}
          />
        </div>
      )}

      {/* Hint */}
      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        <span className="text-text-tertiary text-xs">
          Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
        </span>
      </div>
    </div>
  )
}
