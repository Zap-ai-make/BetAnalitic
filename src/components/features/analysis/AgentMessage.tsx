"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { type Agent } from "./AgentPill"

export interface AgentMessageProps {
  agent: Agent
  content: string
  timestamp: Date | string
  isStreaming?: boolean
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <h4
              key={i}
              className="font-display font-semibold text-base text-text-primary mt-3"
            >
              {line.slice(4)}
            </h4>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="font-display font-semibold text-lg text-text-primary mt-4"
            >
              {line.slice(3)}
            </h3>
          )
        }
        if (line.startsWith("# ")) {
          return (
            <h2
              key={i}
              className="font-display font-bold text-xl text-text-primary mt-4"
            >
              {line.slice(2)}
            </h2>
          )
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 text-text-secondary list-disc">
              {formatInlineMarkdown(line.slice(2))}
            </li>
          )
        }
        if (line.match(/^\d+\. /)) {
          const text = line.replace(/^\d+\. /, "")
          return (
            <li key={i} className="ml-4 text-text-secondary list-decimal">
              {formatInlineMarkdown(text)}
            </li>
          )
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-text-secondary leading-relaxed">
            {formatInlineMarkdown(line)}
          </p>
        )
      })}
    </div>
  )
}

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const codeMatch = remaining.match(/`(.+?)`/)

    if (boldMatch && (!codeMatch || boldMatch.index! <= codeMatch.index!)) {
      if (boldMatch.index! > 0) {
        parts.push(remaining.slice(0, boldMatch.index))
      }
      parts.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {boldMatch[1]}
        </strong>
      )
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length)
    } else if (codeMatch) {
      if (codeMatch.index! > 0) {
        parts.push(remaining.slice(0, codeMatch.index))
      }
      parts.push(
        <code
          key={key++}
          className="font-mono text-sm bg-bg-tertiary px-1.5 py-0.5 rounded text-accent-cyan"
        >
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch.index! + codeMatch[0].length)
    } else {
      parts.push(remaining)
      break
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export function AgentMessage({
  agent,
  content,
  timestamp,
  isStreaming,
}: AgentMessageProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-lg p-4 border-l-4 transition-all",
        "min-h-[44px]"
      )}
      style={{ borderLeftColor: `var(--color-agent-${agent.id})` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ backgroundColor: `var(--color-agent-${agent.id})20` }}
        >
          {agent.avatar}
        </span>
        <div className="flex flex-col">
          <span
            className="font-display font-semibold text-base"
            style={{ color: `var(--color-agent-${agent.id})` }}
          >
            {agent.name}
          </span>
          <span className="text-text-tertiary text-xs">
            {formatTime(timestamp)}
          </span>
        </div>
        {isStreaming && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
            </span>
            <span className="text-accent-cyan text-xs font-medium">
              En cours...
            </span>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="font-body text-sm">
        <SimpleMarkdown content={content} />
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-text-primary animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  )
}
