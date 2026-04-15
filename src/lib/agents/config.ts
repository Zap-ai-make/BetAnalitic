import type { AgentMetadata } from "./types"

/**
 * 14 Agent configurations for BetAnalytic
 */
export const AGENTS: AgentMetadata[] = [
  // ============================================
  // DATA CATEGORY
  // ============================================
  {
    id: "scout",
    name: "Scout",
    description: "Détecte les matchs à fort potentiel et les opportunités cachées",
    color: "#00D9FF",
    emoji: "🔍",
    category: "Data",
    soulPath: "/agents/souls/scout.md",
    isEnabled: true,
    order: 1,
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Analyse statistique approfondie des équipes et joueurs",
    color: "#4ECDC4",
    emoji: "📊",
    category: "Data",
    soulPath: "/agents/souls/analyst.md",
    isEnabled: true,
    order: 2,
  },

  // ============================================
  // ANALYSE CATEGORY
  // ============================================
  {
    id: "predictor",
    name: "Predictor",
    description: "Modèles prédictifs basés sur l'IA pour anticiper les résultats",
    color: "#FF6B6B",
    emoji: "🎯",
    category: "Analyse",
    soulPath: "/agents/souls/predictor.md",
    isEnabled: true,
    order: 3,
  },
  {
    id: "historian",
    name: "Historian",
    description: "Analyse les confrontations historiques et tendances",
    color: "#95E1D3",
    emoji: "📜",
    category: "Analyse",
    soulPath: "/agents/souls/historian.md",
    isEnabled: true,
    order: 4,
  },
  {
    id: "motivation",
    name: "Motivation",
    description: "Évalue la motivation et les enjeux pour chaque équipe",
    color: "#F38181",
    emoji: "🔥",
    category: "Analyse",
    soulPath: "/agents/souls/motivation.md",
    isEnabled: true,
    order: 5,
  },

  // ============================================
  // MARCHÉ CATEGORY
  // ============================================
  {
    id: "odds",
    name: "Odds Master",
    description: "Compare les cotes entre bookmakers pour trouver la valeur",
    color: "#AA96DA",
    emoji: "💹",
    category: "Marché",
    soulPath: "/agents/souls/odds.md",
    isEnabled: true,
    order: 6,
  },
  {
    id: "risk",
    name: "Risk Advisor",
    description: "Évalue les risques et conseille sur la gestion de bankroll",
    color: "#FCBAD3",
    emoji: "⚠️",
    category: "Marché",
    soulPath: "/agents/souls/risk.md",
    isEnabled: true,
    order: 7,
  },
  {
    id: "combo",
    name: "Combo Builder",
    description: "Construit des combinés optimisés selon votre profil",
    color: "#FFFFD2",
    emoji: "🧩",
    category: "Marché",
    soulPath: "/agents/souls/combo.md",
    isEnabled: true,
    order: 8,
  },

  // ============================================
  // INTEL CATEGORY
  // ============================================
  {
    id: "news",
    name: "News",
    description: "Actualités et informations d'avant-match",
    color: "#A8D8EA",
    emoji: "📰",
    category: "Intel",
    soulPath: "/agents/souls/news.md",
    isEnabled: true,
    order: 9,
  },
  {
    id: "weather",
    name: "Weather",
    description: "Impact de la météo et conditions de jeu",
    color: "#AA96DA",
    emoji: "🌤️",
    category: "Intel",
    soulPath: "/agents/souls/weather.md",
    isEnabled: true,
    order: 10,
  },
  {
    id: "social",
    name: "Social",
    description: "Sentiment des fans et analyse des réseaux sociaux",
    color: "#FCBAD3",
    emoji: "💬",
    category: "Intel",
    soulPath: "/agents/souls/social.md",
    isEnabled: true,
    order: 11,
  },
  {
    id: "lineup",
    name: "Lineup",
    description: "Compositions probables et impact des absences",
    color: "#FFFFD2",
    emoji: "👥",
    category: "Intel",
    soulPath: "/agents/souls/lineup.md",
    isEnabled: true,
    order: 12,
  },

  // ============================================
  // LIVE CATEGORY
  // ============================================
  {
    id: "live",
    name: "Live Tracker",
    description: "Suivi en temps réel et alertes pendant les matchs",
    color: "#FF6B6B",
    emoji: "⚡",
    category: "Live",
    soulPath: "/agents/souls/live.md",
    isEnabled: true,
    order: 13,
  },
  {
    id: "advisor",
    name: "Advisor",
    description: "Synthèse finale et recommandations personnalisées",
    color: "#4ECDC4",
    emoji: "🎓",
    category: "Live",
    soulPath: "/agents/souls/advisor.md",
    isEnabled: true,
    order: 14,
  },
]

/**
 * Get agent by ID helper
 */
export function getAgentConfig(id: string): AgentMetadata | undefined {
  return AGENTS.find((a) => a.id === id)
}

/**
 * Get agents by category helper
 */
export function getAgentsByCategory(category: AgentMetadata["category"]): AgentMetadata[] {
  return AGENTS.filter((a) => a.category === category)
}
