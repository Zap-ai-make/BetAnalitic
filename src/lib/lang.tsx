"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

export type Lang = "FR" | "EN"

// ── All translations ──────────────────────────────────────────
export const T = {
  FR: {
    nav: {
      home: "Accueil",
      matches: "Matchs",
      signals: "Signaux",
      bets: "Paris",
      rooms: "Salles",
    },
    intro: {
      l0: "Les gagnants n'ont pas plus de chance. Ils ont plus d'informations.",
      l1: "Compositions réelles · Blessures cachées · Tensions de vestiaire · Forme des joueurs · Signaux de value en direct.",
      l2: "Arrêtez de parier. Commencez à investir.",
    },
    analysis: {
      title: "Intelligence Briefing",
      balance: "Solde",
      signals: "Signaux du Jour",
      noSignals: "Aucun signal pour aujourd'hui",
      noSignalsHint: "Les agents analysent les matchs à 08:00",
      analyze: "Analyser",
      addCoupon: "Coupon",
      removeCoupon: "Retirer",
      myCoupon: "Mon Coupon",
      potentialWin: "Gain potentiel",
      validateCoupon: "Valider le coupon →",
      clearCoupon: "Vider",
      stakeIn: "Mise en",
      aiYesterday: "IA hier",
      correct: "corrects",
      accuracy30: "Précision 30j",
      signalStrong: "SIGNAL FORT",
      signalMedium: "SIGNAL MOYEN",
      signalWeak: "SIGNAL FAIBLE",
      confHigh: "Haute",
      confMid: "Moyenne",
      confLow: "Faible",
      accExcellent: "Excellente",
      accGood: "Bonne",
      burstModeActive: "Burst Mode Actif",
      burstModeHint: "Invocations illimitées LIVE",
      fullAnalysis: "Analyse Complète (14 agents)",
      analyzing: "Analyse...",
      agentAnalyzing: "Agent en cours d'analyse…",
      compareAgents: "Comparer les agents",
      matchLoaded: "Match chargé",
      noMatchHint: 'Cliquez sur "Analyser" sur un signal pour charger un match',
      noMatchHint2: "ou tapez @AgentName dans le chat",
      backToSignals: "← Signaux",
      noSpeech: "Votre navigateur ne supporte pas la reconnaissance vocale.",
      micDenied: "Accès micro refusé.",
      ttsNotSupported: "TTS non supporté",
      inputPlaceholder: "@AgentName — ex: @Scout analyse ce match",
      launchFullAnalysis: "Lancer l'analyse complète ?",
      agentsWillAnalyze: "agents vont analyser",
      thisMatch: "ce match",
      cancel: "Annuler",
      launch: "Lancer",
      agentComparison: "Comparaison des Agents",
      consensusIndicator: "Indicateur de consensus",
      strongConsensus: "✅ Fort consensus",
      moderateConsensus: "⚖️ Consensus modéré",
      divergingOpinions: "⚠️ Opinions divergentes",
      avgConfidence: "Confiance moyenne",
      stdDev: "écart-type",
      insufficientData: "⏳ Données insuffisantes",
      predictionsMinimum: "prédictions (minimum 30 requis)",
      overallAccuracy: "Précision Globale",
      recentForm: "Forme Récente (30j)",
      result: "Résultat",
      goals: "Buts",
      corners: "Corners",
      cards: "Cartes",
      addedValue: "Valeur ajoutée vs hasard (50%)",
      predictionsAnalyzed: "prédictions analysées",
      burstModePremium: "Burst Mode Premium",
      liveMatchDetected: "Match LIVE détecté ! Débloquez l'accès illimité aux agents pendant les matchs en direct.",
      later: "Plus tard",
      goPremium: "Passer Premium",
    },
    oracle: {
      agentSelector: "CHOISIR UN AGENT",
      agentsReady: "14 agents prêts à analyser",
      agentsReadyLong: "14 agents prêts à analyser le match pour vous",
      agentActive: "actif",
      agentActivated: "activé",
      analyzingVia: "Analyse en cours via @GoalMaster + @TacticMaster…",
      processing: "traite ta requête — conf 78%",
      generalAgent: "Généraliste · routage auto",
      messagePlaceholder: "Tape ton message ici…",
      matchReady: "chargé et prêt pour l'analyse ! Je coordonne les 14 agents spécialisés. Quel aspect veux-tu creuser ? (buts, corners, cartons, tactique…) Ou @mentionne directement un agent.",
      newConversation: "Nouvelle conversation",
      history: "Historique des conversations",
      noHistory: "Aucune conversation récente.",
      rename: "Renommer",
      delete: "Supprimer",
    },
  },
  EN: {
    nav: {
      home: "Home",
      matches: "Matches",
      signals: "Signals",
      bets: "Bets",
      rooms: "Rooms",
    },
    intro: {
      l0: "Winners don't have more luck. They have more information.",
      l1: "Real lineups · Hidden injuries · Locker room tensions · Player form · Live value signals.",
      l2: "Stop gambling. Start investing.",
    },
    analysis: {
      title: "Intelligence Briefing",
      balance: "Balance",
      signals: "Today's Signals",
      noSignals: "No signals for today",
      noSignalsHint: "Agents analyze matches at 08:00",
      analyze: "Analyze",
      addCoupon: "Add",
      removeCoupon: "Remove",
      myCoupon: "My Coupon",
      potentialWin: "Potential win",
      validateCoupon: "Confirm coupon →",
      clearCoupon: "Clear",
      stakeIn: "Stake in",
      aiYesterday: "AI yesterday",
      correct: "correct",
      accuracy30: "30d accuracy",
      signalStrong: "STRONG SIGNAL",
      signalMedium: "MEDIUM SIGNAL",
      signalWeak: "WEAK SIGNAL",
      confHigh: "High",
      confMid: "Medium",
      confLow: "Low",
      accExcellent: "Excellent",
      accGood: "Good",
      burstModeActive: "Burst Mode Active",
      burstModeHint: "Unlimited LIVE invocations",
      fullAnalysis: "Full Analysis (14 agents)",
      analyzing: "Analyzing...",
      agentAnalyzing: "Agent analyzing…",
      compareAgents: "Compare agents",
      matchLoaded: "Match loaded",
      noMatchHint: 'Click "Analyze" on a signal to load a match',
      noMatchHint2: "or type @AgentName in chat",
      backToSignals: "← Signals",
      noSpeech: "Your browser does not support speech recognition.",
      micDenied: "Microphone access denied.",
      ttsNotSupported: "TTS not supported",
      inputPlaceholder: "@AgentName — e.g: @Scout analyze this match",
      launchFullAnalysis: "Launch full analysis?",
      agentsWillAnalyze: "agents will analyze",
      thisMatch: "this match",
      cancel: "Cancel",
      launch: "Launch",
      agentComparison: "Agent Comparison",
      consensusIndicator: "Consensus Indicator",
      strongConsensus: "✅ Strong consensus",
      moderateConsensus: "⚖️ Moderate consensus",
      divergingOpinions: "⚠️ Diverging opinions",
      avgConfidence: "Average confidence",
      stdDev: "std dev",
      insufficientData: "⏳ Insufficient data",
      predictionsMinimum: "predictions (minimum 30 required)",
      overallAccuracy: "Overall Accuracy",
      recentForm: "Recent Form (30d)",
      result: "Result",
      goals: "Goals",
      corners: "Corners",
      cards: "Cards",
      addedValue: "Added value vs random (50%)",
      predictionsAnalyzed: "predictions analyzed",
      burstModePremium: "Burst Mode Premium",
      liveMatchDetected: "LIVE match detected! Unlock unlimited agent access during live matches.",
      later: "Later",
      goPremium: "Go Premium",
    },
    oracle: {
      agentSelector: "CHOOSE AN AGENT",
      agentsReady: "14 agents ready to analyze",
      agentsReadyLong: "14 agents ready to analyze the match for you",
      agentActive: "active",
      agentActivated: "activated",
      analyzingVia: "Analyzing via @GoalMaster + @TacticMaster…",
      processing: "processing your query — conf 78%",
      generalAgent: "Generalist · auto-routing",
      messagePlaceholder: "Type your message here…",
      matchReady: "loaded and ready for analysis! I'm coordinating 14 specialized agents. Which aspect do you want to dig into? (goals, corners, cards, tactics…) Or @mention an agent directly.",
      newConversation: "New conversation",
      history: "Conversation History",
      noHistory: "No recent conversations.",
      rename: "Rename",
      delete: "Delete",
    },
  },
} as const

export type Translations = typeof T.FR

// ── Context ───────────────────────────────────────────────────
interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  lang: "FR",
  setLang: () => undefined,
  t: T.FR,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("FR")

  useEffect(() => {
    const stored = localStorage.getItem("betanalytic_lang")
    if (stored === "EN" || stored === "FR") setLangState(stored)

    const handler = (e: StorageEvent) => {
      if (e.key === "betanalytic_lang" && (e.newValue === "EN" || e.newValue === "FR"))
        setLangState(e.newValue)
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("betanalytic_lang", l)
    window.dispatchEvent(new StorageEvent("storage", { key: "betanalytic_lang", newValue: l }))
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
