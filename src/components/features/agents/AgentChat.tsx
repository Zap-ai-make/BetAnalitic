"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { AgentMessage } from "./AgentMessage"
import { AgentMentionDropdown } from "./AgentMentionDropdown"
import { AgentErrorState } from "./AgentErrorState"
import { Send, Loader2 } from "lucide-react"
import type { AgentMetadata } from "~/lib/agents/types"
import type { FeedbackType } from "./AgentFeedback"
import type { Citation } from "./CitationLink"

interface AgentChatProps {
  conversationId?: string
  agentType?: string
  matchId?: string
  className?: string
}

export function AgentChat({
  conversationId: initialConversationId,
  agentType,
  matchId,
  className,
}: AgentChatProps) {
  const [conversationId, setConversationId] = React.useState<string | undefined>(
    initialConversationId
  )
  const [input, setInput] = React.useState("")
  const [showMentions, setShowMentions] = React.useState(false)
  const [mentionFilter, setMentionFilter] = React.useState("")
  const [selectedMentionIndex, setSelectedMentionIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Fetch agents
  const { data: agents = [] } = api.agents.getEnabled.useQuery()

  // Fetch conversation
  const { data: conversation, isLoading: loadingConversation } =
    api.agents.getConversation.useQuery(
      { id: conversationId! },
      { enabled: !!conversationId }
    )

  // Create conversation mutation
  const createConversation = api.agents.createConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.id)
    },
  })

  // Send message mutation
  const sendMessage = api.agents.sendMessage.useMutation({
    onSuccess: () => {
      setInput("")
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    },
  })

  // Feedback mutation
  const submitFeedback = api.agents.submitFeedback.useMutation()

  // Filter agents based on mention input
  const filteredAgents = React.useMemo(() => {
    if (!mentionFilter) return agents
    const filter = mentionFilter.toLowerCase()
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(filter) ||
        agent.id.toLowerCase().includes(filter)
    )
  }, [agents, mentionFilter])

  // Detect @ mention
  React.useEffect(() => {
    const lastWord = input.split(" ").pop() ?? ""
    if (lastWord.startsWith("@")) {
      setShowMentions(true)
      setMentionFilter(lastWord.slice(1))
      setSelectedMentionIndex(0)
    } else {
      setShowMentions(false)
      setMentionFilter("")
    }
  }, [input])

  // Handle mention selection
  const handleSelectMention = (agent: AgentMetadata) => {
    const words = input.split(" ")
    words[words.length - 1] = `@${agent.name} `
    setInput(words.join(" "))
    setShowMentions(false)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation in mentions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredAgents.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedMentionIndex((i) =>
          i < filteredAgents.length - 1 ? i + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedMentionIndex((i) =>
          i > 0 ? i - 1 : filteredAgents.length - 1
        )
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        const selected = filteredAgents[selectedMentionIndex]
        if (selected) {
          handleSelectMention(selected)
        }
        return
      } else if (e.key === "Escape") {
        setShowMentions(false)
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || sendMessage.isPending) return

    // Create conversation if needed
    if (!conversationId && agentType) {
      const conv = await createConversation.mutateAsync({
        agentType: agentType as "SCOUT" | "FORM" | "H2H" | "STATS" | "MOMENTUM" | "CONTEXT" | "ODDS" | "WEATHER" | "REFEREE" | "INJURY" | "SENTIMENT" | "PREDICTION" | "RISK" | "VALUE",
        matchId,
      })
      setConversationId(conv.id)
      sendMessage.mutate({
        conversationId: conv.id,
        content: input.trim(),
      })
    } else if (conversationId) {
      sendMessage.mutate({
        conversationId,
        content: input.trim(),
      })
    }
  }

  // Handle feedback
  const handleFeedback = (
    responseId: string,
    type: FeedbackType,
    details?: string
  ) => {
    submitFeedback.mutate({
      messageId: responseId,
      rating: type === "positive" ? "THUMBS_UP" : "THUMBS_DOWN",
      comment: details,
    })
  }

  // Auto-scroll on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  if (loadingConversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages.map((msg) => {
          if (msg.role === "AGENT") {
            const agent = agents.find(
              (a) => a.id === conversation.agentType.toLowerCase()
            )
            return (
              <AgentMessage
                key={msg.id}
                agentId={agent?.id ?? "unknown"}
                agentName={agent?.name ?? "Agent"}
                agentEmoji={agent?.emoji ?? "🤖"}
                message={msg.content}
                responseId={msg.id}
                citations={
                  (msg.sources as Citation[] | null | undefined) ?? undefined
                }
                isComplete={true}
                timestamp={msg.createdAt}
                onFeedback={handleFeedback}
              />
            )
          }

          // User message
          return (
            <div
              key={msg.id}
              className="flex justify-end"
            >
              <div className="bg-accent-cyan/10 rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-text-primary whitespace-pre-wrap">
                  {msg.content}
                </p>
                <span className="text-xs text-text-tertiary mt-1 block">
                  {msg.createdAt.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )
        })}

        {/* Loading state */}
        {sendMessage.isPending && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">L&apos;agent réfléchit...</span>
          </div>
        )}

        {/* Error state */}
        {sendMessage.error && (
          <AgentErrorState
            agentId={agentType ?? "scout"}
            error={sendMessage.error.message}
            onRetry={() => handleSend()}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-bg-tertiary p-4 relative">
        {/* Mention dropdown */}
        {showMentions && filteredAgents.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-2">
            <AgentMentionDropdown
              agents={filteredAgents}
              selectedIndex={selectedMentionIndex}
              filterText={mentionFilter}
              onSelect={handleSelectMention}
            />
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question... (utilisez @ pour mentionner un agent)"
            className={cn(
              "flex-1 bg-bg-secondary rounded-lg px-4 py-3",
              "text-text-primary placeholder:text-text-tertiary",
              "border border-bg-tertiary focus:border-accent-cyan focus:outline-none",
              "resize-none max-h-32",
              "transition-colors"
            )}
            rows={1}
            disabled={sendMessage.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className={cn(
              "px-4 rounded-lg",
              "bg-accent-cyan text-bg-primary font-medium",
              "hover:bg-accent-cyan/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all",
              "min-w-[44px] min-h-[44px]",
              "flex items-center justify-center"
            )}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-text-tertiary mt-2">
          Tapez @ pour mentionner un agent • Shift+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  )
}
