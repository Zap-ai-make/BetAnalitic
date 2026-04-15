"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { Lock, Sparkles } from "lucide-react"
import { getAgentRegistry } from "~/lib/agents/registry"

interface GuestAgentPreviewProps {
  matchId?: string
  className?: string
}

// Sample preview responses for guests
const PREVIEW_RESPONSES: Record<string, string> = {
  "data-scout":
    "📊 Sur les 10 derniers matchs, cette équipe affiche une moyenne de 1.8 buts marqués à domicile...",
  "value-hunter":
    "💰 Notre analyse détecte une potentielle value bet sur le marché des corners...",
  "odds-oracle":
    "📈 La cote a baissé de 2.30 à 2.05 en 24h, suggérant un mouvement significatif...",
  "insider-intel":
    "🔍 Le joueur clé de l'équipe est incertain pour cette rencontre selon les dernières...",
}

export function GuestAgentPreview({
  matchId,
  className,
}: GuestAgentPreviewProps) {
  const router = useRouter()
  const registry = getAgentRegistry()
  const agents = registry.getEnabled().slice(0, 4) // Show first 4 agents

  const handleSignUp = () => {
    const redirectUrl = matchId ? `/matches/${matchId}` : "/matches"
    router.push(`/register?redirect=${encodeURIComponent(redirectUrl)}`)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          🤖 Agents IA
        </h3>
        <span className="px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded-full">
          Aperçu
        </span>
      </div>

      {/* Blurred Preview Cards */}
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={cn(
              "relative bg-bg-secondary rounded-lg p-4 border-l-4",
              "overflow-hidden"
            )}
            style={{ borderLeftColor: agent.color }}
          >
            {/* Agent Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{agent.emoji}</span>
              <span
                className="font-display font-semibold text-sm"
                style={{ color: agent.color }}
              >
                {agent.name}
              </span>
            </div>

            {/* Blurred Preview Text */}
            <div className="relative">
              <p className="text-sm text-text-secondary line-clamp-2 blur-[2px] select-none">
                {PREVIEW_RESPONSES[agent.id] ?? agent.description}
              </p>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-secondary/80 to-bg-secondary flex items-center justify-end pr-2">
                <Lock className="w-4 h-4 text-text-tertiary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-green/10 rounded-lg p-4 text-center">
        <Sparkles className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
        <h4 className="font-display font-semibold text-text-primary mb-1">
          Débloquez les analyses IA
        </h4>
        <p className="text-sm text-text-secondary mb-4">
          Créez un compte gratuit pour accéder aux 10 agents spécialisés.
        </p>
        <button
          type="button"
          onClick={handleSignUp}
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "bg-accent-cyan text-bg-primary",
            "font-display font-semibold text-sm",
            "min-h-[44px] transition-colors",
            "hover:bg-accent-cyan/80"
          )}
        >
          Créer un compte gratuit
        </button>
        <p className="text-xs text-text-tertiary mt-2">
          10 analyses/jour en version gratuite
        </p>
      </div>
    </div>
  )
}
