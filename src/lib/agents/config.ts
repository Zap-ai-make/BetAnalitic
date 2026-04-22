import type { AgentMetadata } from "./types"

/**
 * 14 agents mapped to BetAnalytic API types.
 * betanalyticType = exact string used in POST /api/matches/{id}/analyze { agent_type }
 *
 * Agents without BetAnalytic equivalent (COMBO, LIVE, NEWS) are kept with
 * isEnabled: false until VPS adds the corresponding endpoints (see adapter-cote-vps.md).
 */
export const AGENTS: AgentMetadata[] = [
  // ── DATA ──────────────────────────────────────────────────────────────────
  {
    id: "scout",
    name: "Scout",
    description: "Collecte et synthèse des données du match",
    color: "#00D9FF",
    emoji: "🔍",
    category: "Data",
    soulPath: "/agents/souls/scout.md",
    isEnabled: true,
    order: 1,
    tier: "FREE",
    betanalyticType: "SCOUT",
    historicalAccuracy: {
      overallAccuracy: 68,
      recentForm: 72,
      predictionBreakdown: { result: 65, goals: 70, corners: 68, cards: 69 },
      totalPredictions: 342,
    },
  },
  {
    id: "analyst",
    name: "Form Analyst",
    description: "Analyse de la forme récente des équipes sur les 5 derniers matchs",
    color: "#4ECDC4",
    emoji: "📊",
    category: "Data",
    soulPath: "/agents/souls/analyst.md",
    isEnabled: true,
    order: 2,
    tier: "FREE",
    betanalyticType: "FORM",
    historicalAccuracy: {
      overallAccuracy: 73,
      recentForm: 75,
      predictionBreakdown: { result: 71, goals: 76, corners: 72, cards: 73 },
      totalPredictions: 456,
    },
  },

  // ── ANALYSE ───────────────────────────────────────────────────────────────
  {
    id: "historian",
    name: "Head-to-Head",
    description: "Confrontations directes historiques entre les deux équipes",
    color: "#95E1D3",
    emoji: "⚔️",
    category: "Analyse",
    soulPath: "/agents/souls/historian.md",
    isEnabled: true,
    order: 3,
    tier: "FREE",
    betanalyticType: "H2H",
    historicalAccuracy: {
      overallAccuracy: 71,
      recentForm: 69,
      predictionBreakdown: { result: 73, goals: 70, corners: 68, cards: 72 },
      totalPredictions: 523,
    },
  },
  {
    id: "momentum",
    name: "Momentum",
    description: "Dynamique et élan des équipes sur la série en cours",
    color: "#6BCBF7",
    emoji: "🌊",
    category: "Analyse",
    soulPath: "/agents/souls/momentum.md",
    isEnabled: true,
    order: 4,
    tier: "FREE",
    betanalyticType: "MOMENTUM",
    historicalAccuracy: {
      overallAccuracy: 66,
      recentForm: 68,
      predictionBreakdown: { result: 67, goals: 65, corners: 66, cards: 66 },
      totalPredictions: 298,
    },
  },
  {
    id: "motivation",
    name: "Context",
    description: "Contexte du match : enjeux, motivation, pression classement",
    color: "#F38181",
    emoji: "🧠",
    category: "Analyse",
    soulPath: "/agents/souls/motivation.md",
    isEnabled: true,
    order: 5,
    tier: "FREE",
    betanalyticType: "CONTEXT",
    historicalAccuracy: {
      overallAccuracy: 64,
      recentForm: 67,
      predictionBreakdown: { result: 66, goals: 62, corners: 63, cards: 65 },
      totalPredictions: 287,
    },
  },
  {
    id: "referee",
    name: "Referee Watch",
    description: "Profil de l'arbitre : cartons, seuils et tendances disciplinaires",
    color: "#FFD700",
    emoji: "🟨",
    category: "Analyse",
    soulPath: "/agents/souls/referee.md",
    isEnabled: true,
    order: 6,
    tier: "FREE",
    betanalyticType: "REFEREE",
    historicalAccuracy: {
      overallAccuracy: 62,
      recentForm: 64,
      predictionBreakdown: { result: 60, goals: 61, corners: 63, cards: 65 },
      totalPredictions: 201,
    },
  },

  // ── MARCHÉ ────────────────────────────────────────────────────────────────
  {
    id: "stats",
    name: "Stats Master",
    description: "Stats avancées avec modèle Poisson/Dixon-Coles et données xG",
    color: "#4ECDC4",
    emoji: "📈",
    category: "Marché",
    soulPath: "/agents/souls/stats.md",
    isEnabled: true,
    order: 7,
    tier: "PREMIUM",
    betanalyticType: "STATS",
    historicalAccuracy: {
      overallAccuracy: 74,
      recentForm: 76,
      predictionBreakdown: { result: 72, goals: 78, corners: 74, cards: 72 },
      totalPredictions: 412,
    },
  },
  {
    id: "odds",
    name: "Odds Whisperer",
    description: "Mouvement des cotes et détection de valeur sur les marchés",
    color: "#AA96DA",
    emoji: "💰",
    category: "Marché",
    soulPath: "/agents/souls/odds.md",
    isEnabled: true,
    order: 8,
    tier: "PREMIUM",
    betanalyticType: "ODDS",
    historicalAccuracy: {
      overallAccuracy: 76,
      recentForm: 78,
      predictionBreakdown: { result: 74, goals: 77, corners: 76, cards: 77 },
      totalPredictions: 489,
    },
  },
  {
    id: "risk",
    name: "Risk Guardian",
    description: "Analyse des risques et conseils bankroll",
    color: "#FCBAD3",
    emoji: "⚠️",
    category: "Marché",
    soulPath: "/agents/souls/risk.md",
    isEnabled: true,
    order: 9,
    tier: "PREMIUM",
    betanalyticType: "RISK",
    historicalAccuracy: {
      overallAccuracy: 69,
      recentForm: 71,
      predictionBreakdown: { result: 68, goals: 70, corners: 69, cards: 69 },
      totalPredictions: 398,
    },
  },

  // ── INTEL ─────────────────────────────────────────────────────────────────
  {
    id: "weather",
    name: "Weather Guru",
    description: "Impact des conditions météo sur le style de jeu",
    color: "#A8D8EA",
    emoji: "☁️",
    category: "Intel",
    soulPath: "/agents/souls/weather.md",
    isEnabled: true,
    order: 10,
    tier: "FREE",
    betanalyticType: "WEATHER",
    historicalAccuracy: {
      overallAccuracy: 55,
      recentForm: 57,
      predictionBreakdown: { result: 56, goals: 54, corners: 55, cards: 55 },
      totalPredictions: 178,
    },
  },
  {
    id: "lineup",
    name: "Injury Alert",
    description: "Blessés, suspendus et impact des absences sur la composition",
    color: "#FF8C8C",
    emoji: "🏥",
    category: "Intel",
    soulPath: "/agents/souls/lineup.md",
    isEnabled: true,
    order: 11,
    tier: "FREE",
    betanalyticType: "INJURY",
    historicalAccuracy: {
      overallAccuracy: 67,
      recentForm: 70,
      predictionBreakdown: { result: 68, goals: 66, corners: 66, cards: 68 },
      totalPredictions: 401,
    },
  },
  {
    id: "social",
    name: "Sentiment Pulse",
    description: "Sentiment médiatique et analyse des réseaux sociaux",
    color: "#FCBAD3",
    emoji: "💬",
    category: "Intel",
    soulPath: "/agents/souls/social.md",
    isEnabled: true,
    order: 12,
    tier: "PREMIUM",
    betanalyticType: "SENTIMENT",
    historicalAccuracy: {
      overallAccuracy: 60,
      recentForm: 62,
      predictionBreakdown: { result: 61, goals: 59, corners: 60, cards: 60 },
      totalPredictions: 245,
    },
  },

  // ── SYNTHÈSE ──────────────────────────────────────────────────────────────
  {
    id: "predictor",
    name: "Predict Master",
    description: "Synthèse prédictive multi-modèles pour le pronostic final",
    color: "#FF6B6B",
    emoji: "🎯",
    category: "Synthèse",
    soulPath: "/agents/souls/predictor.md",
    isEnabled: true,
    order: 13,
    tier: "PREMIUM",
    betanalyticType: "PREDICT",
    historicalAccuracy: {
      overallAccuracy: 82,
      recentForm: 84,
      predictionBreakdown: { result: 80, goals: 85, corners: 81, cards: 82 },
      totalPredictions: 612,
    },
  },
  {
    id: "advisor",
    name: "Value Hunter",
    description: "Détection de value statistique et recommandations expert",
    color: "#4ECDC4",
    emoji: "💎",
    category: "Synthèse",
    soulPath: "/agents/souls/advisor.md",
    isEnabled: true,
    order: 14,
    tier: "EXPERT",
    betanalyticType: "VALUE",
    historicalAccuracy: {
      overallAccuracy: 78,
      recentForm: 80,
      predictionBreakdown: { result: 77, goals: 79, corners: 78, cards: 78 },
      totalPredictions: 534,
    },
  },

  // ── DÉSACTIVÉS (pas d'équivalent BetAnalytic — voir adapter-cote-vps.md) ──
  {
    id: "combo",
    name: "Combo Builder",
    description: "Combinés optimisés multi-matchs (en attente d'implémentation VPS)",
    color: "#FFFFD2",
    emoji: "🧩",
    category: "Synthèse",
    soulPath: "/agents/souls/combo.md",
    isEnabled: false,
    order: 15,
    tier: "PREMIUM",
    betanalyticType: "COMBO",
  },
  {
    id: "live",
    name: "Live Tracker",
    description: "Suivi temps réel et alertes en cours de match (en attente VPS)",
    color: "#FF6B6B",
    emoji: "⚡",
    category: "Data",
    soulPath: "/agents/souls/live.md",
    isEnabled: false,
    order: 16,
    tier: "FREE",
    betanalyticType: "LIVE",
  },
  {
    id: "news",
    name: "News",
    description: "Actualités d'avant-match (en attente d'implémentation VPS)",
    color: "#A8D8EA",
    emoji: "📰",
    category: "Intel",
    soulPath: "/agents/souls/news.md",
    isEnabled: false,
    order: 17,
    tier: "FREE",
    betanalyticType: "NEWS",
  },
]

export function getAgentConfig(id: string): AgentMetadata | undefined {
  return AGENTS.find((a) => a.id === id)
}

export function getAgentsByCategory(category: AgentMetadata["category"]): AgentMetadata[] {
  return AGENTS.filter((a) => a.category === category)
}

export function getEnabledAgents(): AgentMetadata[] {
  return AGENTS.filter((a) => a.isEnabled)
}

export function getAgentsByTier(tier: AgentMetadata["tier"]): AgentMetadata[] {
  const order = ["FREE", "PREMIUM", "EXPERT"]
  return AGENTS.filter(
    (a) => a.isEnabled && order.indexOf(a.tier) <= order.indexOf(tier)
  )
}
