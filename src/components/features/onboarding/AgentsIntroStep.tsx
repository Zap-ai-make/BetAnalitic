"use client"

import { useState } from "react"

import { cn } from "~/lib/utils"

const AGENTS = [
  {
    id: "scout",
    name: "Scout",
    emoji: "🔍",
    color: "agent-scout",
    description: "Détecte les matchs à fort potentiel et les opportunités cachées",
  },
  {
    id: "analyst",
    name: "Analyst",
    emoji: "📊",
    color: "agent-analyst",
    description: "Analyse statistique approfondie des équipes et joueurs",
  },
  {
    id: "predictor",
    name: "Predictor",
    emoji: "🎯",
    color: "agent-predictor",
    description: "Modèles prédictifs basés sur l'IA pour anticiper les résultats",
  },
  {
    id: "odds",
    name: "Odds Master",
    emoji: "💹",
    color: "agent-odds",
    description: "Compare les cotes entre bookmakers pour trouver la valeur",
  },
  {
    id: "risk",
    name: "Risk Advisor",
    emoji: "⚠️",
    color: "agent-risk",
    description: "Évalue les risques et conseille sur la gestion de bankroll",
  },
  {
    id: "live",
    name: "Live Tracker",
    emoji: "⚡",
    color: "agent-live",
    description: "Suivi en temps réel et alertes pendant les matchs",
  },
  {
    id: "history",
    name: "Historian",
    emoji: "📜",
    color: "agent-history",
    description: "Analyse les confrontations historiques et tendances",
  },
  {
    id: "weather",
    name: "Weather",
    emoji: "🌤️",
    color: "agent-weather",
    description: "Impact de la météo et conditions de jeu",
  },
  {
    id: "news",
    name: "News",
    emoji: "📰",
    color: "agent-news",
    description: "Actualités et informations d'avant-match",
  },
  {
    id: "social",
    name: "Social",
    emoji: "💬",
    color: "agent-social",
    description: "Sentiment des fans et analyse des réseaux sociaux",
  },
  {
    id: "motivation",
    name: "Motivation",
    emoji: "🔥",
    color: "agent-motivation",
    description: "Évalue la motivation et les enjeux pour chaque équipe",
  },
  {
    id: "lineup",
    name: "Lineup",
    emoji: "👥",
    color: "agent-lineup",
    description: "Compositions probables et impact des absences",
  },
  {
    id: "combo",
    name: "Combo Builder",
    emoji: "🧩",
    color: "agent-combo",
    description: "Construit des combinés optimisés selon votre profil",
  },
  {
    id: "advisor",
    name: "Advisor",
    emoji: "🎓",
    color: "agent-advisor",
    description: "Synthèse finale et recommandations personnalisées",
  },
]

export function AgentsIntroStep() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const selected = AGENTS.find((a) => a.id === selectedAgent)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Vos 14 agents IA
        </h2>
        <p className="text-text-secondary">
          Une équipe d&apos;experts analyse chaque match pour vous
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            className={cn(
              "p-3 rounded-xl transition-all",
              "flex flex-col items-center gap-1",
              selectedAgent === agent.id
                ? `bg-${agent.color}/20 ring-2 ring-${agent.color}`
                : "bg-bg-tertiary hover:bg-bg-tertiary/80"
            )}
          >
            <span className="text-2xl">{agent.emoji}</span>
            <span className="text-xs text-text-secondary truncate w-full text-center">
              {agent.name}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Agent Details */}
      {selected && (
        <div className="bg-bg-tertiary rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{selected.emoji}</span>
            <h3 className="font-display font-bold text-text-primary">
              {selected.name}
            </h3>
          </div>
          <p className="text-sm text-text-secondary">{selected.description}</p>
        </div>
      )}

      {!selected && (
        <div className="bg-bg-tertiary rounded-xl p-4 text-center">
          <p className="text-sm text-text-tertiary">
            Touchez un agent pour en savoir plus
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl p-4">
        <p className="text-sm text-text-secondary text-center">
          Tous les agents travaillent ensemble pour vous fournir une analyse
          complète de chaque match. Plus vous utilisez BetAnalytic, plus ils
          apprennent vos préférences.
        </p>
      </div>
    </div>
  )
}
