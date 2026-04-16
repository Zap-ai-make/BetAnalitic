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
    historicalAccuracy: {
      overallAccuracy: 68,
      recentForm: 72,
      predictionBreakdown: {
        result: 65,
        goals: 70,
        corners: 68,
        cards: 69,
      },
      totalPredictions: 342,
    },
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
    historicalAccuracy: {
      overallAccuracy: 73,
      recentForm: 75,
      predictionBreakdown: {
        result: 71,
        goals: 76,
        corners: 72,
        cards: 73,
      },
      totalPredictions: 456,
    },
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
    historicalAccuracy: {
      overallAccuracy: 82,
      recentForm: 84,
      predictionBreakdown: {
        result: 80,
        goals: 85,
        corners: 81,
        cards: 82,
      },
      totalPredictions: 612,
    },
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
    historicalAccuracy: {
      overallAccuracy: 71,
      recentForm: 69,
      predictionBreakdown: {
        result: 73,
        goals: 70,
        corners: 68,
        cards: 72,
      },
      totalPredictions: 523,
    },
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
    historicalAccuracy: {
      overallAccuracy: 64,
      recentForm: 67,
      predictionBreakdown: {
        result: 66,
        goals: 62,
        corners: 63,
        cards: 65,
      },
      totalPredictions: 287,
    },
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
    historicalAccuracy: {
      overallAccuracy: 76,
      recentForm: 78,
      predictionBreakdown: {
        result: 74,
        goals: 77,
        corners: 76,
        cards: 77,
      },
      totalPredictions: 489,
    },
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
    historicalAccuracy: {
      overallAccuracy: 69,
      recentForm: 71,
      predictionBreakdown: {
        result: 68,
        goals: 70,
        corners: 69,
        cards: 69,
      },
      totalPredictions: 398,
    },
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
    historicalAccuracy: {
      overallAccuracy: 58,
      recentForm: 61,
      predictionBreakdown: {
        result: 59,
        goals: 57,
        corners: 58,
        cards: 58,
      },
      totalPredictions: 234,
    },
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
    historicalAccuracy: {
      overallAccuracy: 63,
      recentForm: 65,
      predictionBreakdown: {
        result: 64,
        goals: 62,
        corners: 62,
        cards: 64,
      },
      totalPredictions: 312,
    },
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
    historicalAccuracy: {
      overallAccuracy: 55,
      recentForm: 57,
      predictionBreakdown: {
        result: 56,
        goals: 54,
        corners: 55,
        cards: 55,
      },
      totalPredictions: 178,
    },
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
    historicalAccuracy: {
      overallAccuracy: 60,
      recentForm: 62,
      predictionBreakdown: {
        result: 61,
        goals: 59,
        corners: 60,
        cards: 60,
      },
      totalPredictions: 245,
    },
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
    historicalAccuracy: {
      overallAccuracy: 67,
      recentForm: 70,
      predictionBreakdown: {
        result: 68,
        goals: 66,
        corners: 66,
        cards: 68,
      },
      totalPredictions: 401,
    },
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
    historicalAccuracy: {
      overallAccuracy: 72,
      recentForm: 74,
      predictionBreakdown: {
        result: 71,
        goals: 73,
        corners: 72,
        cards: 72,
      },
      totalPredictions: 567,
    },
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
    historicalAccuracy: {
      overallAccuracy: 78,
      recentForm: 80,
      predictionBreakdown: {
        result: 77,
        goals: 79,
        corners: 78,
        cards: 78,
      },
      totalPredictions: 534,
    },
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
