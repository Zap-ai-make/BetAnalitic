"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { calculatePasswordStrength } from "~/lib/validations/auth"

export interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password)

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                strength.score >= level ? "" : "bg-bg-tertiary"
              )}
              style={{
                backgroundColor:
                  strength.score >= level ? strength.color : undefined,
              }}
            />
          ))}
        </div>
        {strength.label && (
          <span
            className="text-xs font-medium min-w-[50px] text-right"
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <RequirementItem met={strength.requirements.length} text="8+ caractères" />
        <RequirementItem met={strength.requirements.uppercase} text="Majuscule" />
        <RequirementItem met={strength.requirements.lowercase} text="Minuscule" />
        <RequirementItem met={strength.requirements.number} text="Chiffre" />
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "text-xs transition-colors",
          met ? "text-accent-green" : "text-text-tertiary"
        )}
      >
        {met ? "✓" : "○"}
      </span>
      <span
        className={cn(
          "text-xs transition-colors",
          met ? "text-text-secondary" : "text-text-tertiary"
        )}
      >
        {text}
      </span>
    </div>
  )
}
