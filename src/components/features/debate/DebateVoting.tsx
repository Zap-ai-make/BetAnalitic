"use client"

/**
 * Story 8.4: Debate Voting Panel
 * Vote for debate outcome
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Check, Users } from "lucide-react"

interface VoteOption {
  id: string
  label: string
  description?: string
  voteCount: number
  percentage: number
  color: string
}

interface DebateVotingProps {
  options: VoteOption[]
  totalVotes: number
  selectedOption?: string
  hasVoted: boolean
  isOpen: boolean
  onVote?: (optionId: string) => void
  className?: string
}

export function DebateVoting({
  options,
  totalVotes,
  selectedOption,
  hasVoted,
  isOpen,
  onVote,
  className,
}: DebateVotingProps) {
  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-text-primary">
          Voter pour le vainqueur
        </h3>
        <div className="flex items-center gap-1 text-text-tertiary text-sm">
          <Users className="w-4 h-4" />
          <span>{totalVotes} votes</span>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <VoteOptionButton
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            hasVoted={hasVoted}
            isOpen={isOpen}
            onSelect={() => onVote?.(option.id)}
          />
        ))}
      </div>

      {!isOpen && (
        <p className="text-center text-sm text-text-tertiary mt-4">
          Le vote est clôturé
        </p>
      )}
    </div>
  )
}

function VoteOptionButton({
  option,
  isSelected,
  hasVoted,
  isOpen,
  onSelect,
}: {
  option: VoteOption
  isSelected: boolean
  hasVoted: boolean
  isOpen: boolean
  onSelect: () => void
}) {
  const showResults = hasVoted || !isOpen

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isOpen || hasVoted}
      className={cn(
        "relative w-full p-4 rounded-xl text-left transition-all overflow-hidden",
        "border-2",
        isSelected
          ? "border-accent-cyan bg-accent-cyan/10"
          : "border-bg-tertiary bg-bg-tertiary hover:border-accent-cyan/50",
        (!isOpen || hasVoted) && "cursor-default"
      )}
    >
      {/* Progress bar background */}
      {showResults && (
        <div
          className="absolute inset-0 transition-all"
          style={{
            width: `${option.percentage}%`,
            backgroundColor: `${option.color}20`,
          }}
        />
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: option.color }}
          />
          <div>
            <p className="font-medium text-text-primary">{option.label}</p>
            {option.description && (
              <p className="text-xs text-text-tertiary">{option.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showResults && (
            <span className="text-sm font-mono font-bold text-text-primary">
              {option.percentage}%
            </span>
          )}
          {isSelected && (
            <div className="p-1 bg-accent-cyan rounded-full">
              <Check className="w-3 h-3 text-bg-primary" />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

/**
 * Story 8.5: Debate Winner Announcement
 */
interface DebateWinnerProps {
  winner: "for" | "against" | "tie"
  forPercentage: number
  againstPercentage: number
  totalVotes: number
  className?: string
}

export function DebateWinner({
  winner,
  forPercentage,
  againstPercentage,
  totalVotes,
  className,
}: DebateWinnerProps) {
  const config = {
    for: { label: "Les POUR l'emportent !", emoji: "🎉", color: "text-accent-green" },
    against: { label: "Les CONTRE l'emportent !", emoji: "🎉", color: "text-accent-red" },
    tie: { label: "Égalité parfaite !", emoji: "🤝", color: "text-accent-orange" },
  }

  const result = config[winner]

  return (
    <div className={cn("p-6 bg-bg-secondary rounded-2xl text-center", className)}>
      <div className="text-5xl mb-4">{result.emoji}</div>
      <h3 className={cn("text-xl font-display font-bold mb-2", result.color)}>
        {result.label}
      </h3>

      <div className="flex items-center justify-center gap-8 mt-6">
        <div>
          <p className="text-3xl font-bold font-mono text-accent-green">
            {forPercentage}%
          </p>
          <p className="text-sm text-text-tertiary">POUR</p>
        </div>

        <div className="text-2xl text-text-tertiary">vs</div>

        <div>
          <p className="text-3xl font-bold font-mono text-accent-red">
            {againstPercentage}%
          </p>
          <p className="text-sm text-text-tertiary">CONTRE</p>
        </div>
      </div>

      <p className="text-sm text-text-tertiary mt-4">
        {totalVotes} vote{totalVotes > 1 ? "s" : ""} au total
      </p>
    </div>
  )
}
