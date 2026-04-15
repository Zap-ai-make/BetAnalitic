"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

const AGENTS = [
  { id: "scout", name: "Scout", emoji: "🔍" },
  { id: "analyst", name: "Analyst", emoji: "📊" },
  { id: "predictor", name: "Predictor", emoji: "🎯" },
  { id: "odds", name: "Odds Master", emoji: "💹" },
  { id: "risk", name: "Risk Advisor", emoji: "⚠️" },
  { id: "live", name: "Live Tracker", emoji: "⚡" },
  { id: "history", name: "Historian", emoji: "📜" },
  { id: "weather", name: "Weather", emoji: "🌤️" },
  { id: "news", name: "News", emoji: "📰" },
  { id: "social", name: "Social", emoji: "💬" },
  { id: "motivation", name: "Motivation", emoji: "🔥" },
  { id: "lineup", name: "Lineup", emoji: "👥" },
  { id: "combo", name: "Combo Builder", emoji: "🧩" },
  { id: "advisor", name: "Advisor", emoji: "🎓" },
]

type EmailDigest = "NONE" | "DAILY" | "WEEKLY"

export default function NotificationSettingsPage() {
  const { data: prefs, isLoading } = api.notifications.getPreferences.useQuery()

  // Local state for form
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState<EmailDigest>("NONE")
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [dndEnabled, setDndEnabled] = useState(false)
  const [dndStart, setDndStart] = useState("22:00")
  const [dndEnd, setDndEnd] = useState("08:00")
  const [matchAlerts, setMatchAlerts] = useState(true)
  const [agentAlerts, setAgentAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [agentNotifications, setAgentNotifications] = useState<Record<string, boolean>>({})
  const [showAgents, setShowAgents] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const utils = api.useUtils()

  const updateMutation = api.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      setHasChanges(false)
      void utils.notifications.getPreferences.invalidate()
    },
  })

  // Initialize state from server data
  useEffect(() => {
    if (prefs) {
      setPushEnabled(prefs.pushEnabled)
      setEmailDigest(prefs.emailDigest)
      setInAppAlerts(prefs.inAppAlerts)
      setDndEnabled(prefs.dndEnabled)
      setDndStart(prefs.dndStart)
      setDndEnd(prefs.dndEnd)
      setMatchAlerts(prefs.matchAlerts)
      setAgentAlerts(prefs.agentAlerts)
      setWeeklyDigest(prefs.weeklyDigest)
      setAgentNotifications(prefs.agentNotifications)
    }
  }, [prefs])

  const handleSave = () => {
    updateMutation.mutate({
      pushEnabled,
      emailDigest,
      inAppAlerts,
      dndEnabled,
      dndStart,
      dndEnd,
      matchAlerts,
      agentAlerts,
      weeklyDigest,
      agentNotifications,
    })
  }

  const toggleAgentNotification = (agentId: string) => {
    setAgentNotifications((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }))
    setHasChanges(true)
  }

  const Toggle = ({
    enabled,
    onChange,
  }: {
    enabled: boolean
    onChange: (value: boolean) => void
  }) => (
    <button
      onClick={() => {
        onChange(!enabled)
        setHasChanges(true)
      }}
      className={cn(
        "w-12 h-7 rounded-full transition-all relative shrink-0",
        enabled ? "bg-accent-cyan" : "bg-bg-tertiary"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
          enabled ? "right-1" : "left-1"
        )}
      />
    </button>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/profile" className="text-text-secondary hover:text-text-primary">
            ← Retour
          </Link>
          <h1 className="font-display font-bold text-text-primary">Notifications</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Main Toggles */}
        <div className="bg-bg-secondary rounded-xl divide-y divide-bg-tertiary">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-medium text-text-primary">Notifications push</p>
                <p className="text-sm text-text-secondary">
                  Alertes sur votre appareil
                </p>
              </div>
            </div>
            <Toggle enabled={pushEnabled} onChange={setPushEnabled} />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-text-primary">Alertes in-app</p>
                <p className="text-sm text-text-secondary">
                  Badges et notifications dans l&apos;app
                </p>
              </div>
            </div>
            <Toggle enabled={inAppAlerts} onChange={setInAppAlerts} />
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium text-text-primary">Résumé par email</p>
                <p className="text-sm text-text-secondary">
                  Recevez un récapitulatif par email
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-10">
              {(["NONE", "DAILY", "WEEKLY"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => {
                    setEmailDigest(freq)
                    setHasChanges(true)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    emailDigest === freq
                      ? "bg-accent-cyan text-bg-primary"
                      : "bg-bg-tertiary text-text-secondary"
                  )}
                >
                  {freq === "NONE" && "Aucun"}
                  {freq === "DAILY" && "Quotidien"}
                  {freq === "WEEKLY" && "Hebdomadaire"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="bg-bg-secondary rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <p className="font-medium text-text-primary">Ne pas déranger</p>
                <p className="text-sm text-text-secondary">
                  Pas de notifications pendant les heures de repos
                </p>
              </div>
            </div>
            <Toggle enabled={dndEnabled} onChange={setDndEnabled} />
          </div>

          {dndEnabled && (
            <div className="flex items-center gap-4 ml-10">
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">De</label>
                <input
                  type="time"
                  value={dndStart}
                  onChange={(e) => {
                    setDndStart(e.target.value)
                    setHasChanges(true)
                  }}
                  className="bg-bg-tertiary px-3 py-2 rounded-lg text-text-primary text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">à</label>
                <input
                  type="time"
                  value={dndEnd}
                  onChange={(e) => {
                    setDndEnd(e.target.value)
                    setHasChanges(true)
                  }}
                  className="bg-bg-tertiary px-3 py-2 rounded-lg text-text-primary text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Alert Types */}
        <div className="bg-bg-secondary rounded-xl divide-y divide-bg-tertiary">
          <h2 className="px-4 py-3 font-display font-semibold text-text-primary">
            Types d&apos;alertes
          </h2>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <p className="font-medium text-text-primary">Alertes matchs</p>
                <p className="text-sm text-text-secondary">
                  Rappels pour vos équipes favorites
                </p>
              </div>
            </div>
            <Toggle enabled={matchAlerts} onChange={setMatchAlerts} />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-medium text-text-primary">Alertes agents IA</p>
                <p className="text-sm text-text-secondary">
                  Opportunités détectées par nos agents
                </p>
              </div>
            </div>
            <Toggle enabled={agentAlerts} onChange={setAgentAlerts} />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium text-text-primary">Résumé hebdomadaire</p>
                <p className="text-sm text-text-secondary">
                  Récap des meilleurs matchs de la semaine
                </p>
              </div>
            </div>
            <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
          </div>
        </div>

        {/* Per-Agent Notifications */}
        <div className="bg-bg-secondary rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎛️</span>
              <div>
                <p className="font-medium text-text-primary">Notifications par agent</p>
                <p className="text-sm text-text-secondary">
                  Configurez chaque agent individuellement
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-text-tertiary transition-transform",
                showAgents && "rotate-90"
              )}
            >
              ›
            </span>
          </button>

          {showAgents && (
            <div className="border-t border-bg-tertiary divide-y divide-bg-tertiary">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.emoji}</span>
                    <span className="text-text-primary">{agent.name}</span>
                  </div>
                  <Toggle
                    enabled={agentNotifications[agent.id] ?? true}
                    onChange={() => toggleAgentNotification(agent.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-bg-tertiary">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      )}
    </div>
  )
}
