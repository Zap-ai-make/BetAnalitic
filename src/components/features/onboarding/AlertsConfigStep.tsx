"use client"

import { cn } from "~/lib/utils"

interface AlertsConfigStepProps {
  matchAlerts: boolean
  agentAlerts: boolean
  weeklyDigest: boolean
  onChange: (key: "matchAlerts" | "agentAlerts" | "weeklyDigest", value: boolean) => void
}

export function AlertsConfigStep({
  matchAlerts,
  agentAlerts,
  weeklyDigest,
  onChange,
}: AlertsConfigStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Notifications
        </h2>
        <p className="text-text-secondary">
          Configurez vos alertes pour ne rien manquer
        </p>
      </div>

      <div className="space-y-3">
        {/* Match Alerts */}
        <button
          onClick={() => onChange("matchAlerts", !matchAlerts)}
          className={cn(
            "w-full p-4 rounded-xl text-left transition-all",
            "flex items-center justify-between",
            "border-2",
            matchAlerts
              ? "border-accent-cyan bg-accent-cyan/5"
              : "border-bg-tertiary bg-bg-secondary"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔔</div>
            <div>
              <h3 className="font-medium text-text-primary">Alertes matchs</h3>
              <p className="text-sm text-text-secondary">
                Rappels avant les matchs de vos équipes
              </p>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-7 rounded-full transition-all relative",
              matchAlerts ? "bg-accent-cyan" : "bg-bg-tertiary"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
                matchAlerts ? "right-1" : "left-1"
              )}
            />
          </div>
        </button>

        {/* Agent Alerts */}
        <button
          onClick={() => onChange("agentAlerts", !agentAlerts)}
          className={cn(
            "w-full p-4 rounded-xl text-left transition-all",
            "flex items-center justify-between",
            "border-2",
            agentAlerts
              ? "border-accent-cyan bg-accent-cyan/5"
              : "border-bg-tertiary bg-bg-secondary"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="font-medium text-text-primary">Alertes agents IA</h3>
              <p className="text-sm text-text-secondary">
                Opportunités détectées par nos agents
              </p>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-7 rounded-full transition-all relative",
              agentAlerts ? "bg-accent-cyan" : "bg-bg-tertiary"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
                agentAlerts ? "right-1" : "left-1"
              )}
            />
          </div>
        </button>

        {/* Weekly Digest */}
        <button
          onClick={() => onChange("weeklyDigest", !weeklyDigest)}
          className={cn(
            "w-full p-4 rounded-xl text-left transition-all",
            "flex items-center justify-between",
            "border-2",
            weeklyDigest
              ? "border-accent-cyan bg-accent-cyan/5"
              : "border-bg-tertiary bg-bg-secondary"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📧</div>
            <div>
              <h3 className="font-medium text-text-primary">Résumé hebdomadaire</h3>
              <p className="text-sm text-text-secondary">
                Récap des meilleurs matchs chaque semaine
              </p>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-7 rounded-full transition-all relative",
              weeklyDigest ? "bg-accent-cyan" : "bg-bg-tertiary"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
                weeklyDigest ? "right-1" : "left-1"
              )}
            />
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-text-tertiary">
        Vous pourrez modifier ces préférences dans les paramètres
      </p>
    </div>
  )
}
