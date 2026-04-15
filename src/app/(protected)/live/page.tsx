"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"

interface AgentMessage {
  id: string
  agentName: string
  agentColor: string
  content: string
  minute: string
}

// Mock data
const MOCK_MATCH = {
  homeTeam: "PSG",
  awayTeam: "OM",
  homeScore: 2,
  awayScore: 1,
  minute: 67,
}

const MOCK_MESSAGES: AgentMessage[] = [
  {
    id: "1",
    agentName: "LivePulse",
    agentColor: "var(--color-agent-live)",
    content: "67' - Le PSG pousse pour le break! Dembélé vient de frapper le poteau...",
    minute: "67'",
  },
  {
    id: "2",
    agentName: "LivePulse",
    agentColor: "var(--color-agent-live)",
    content: "64' - Carton jaune pour Balerdi. Tension maximale dans ce Classico!",
    minute: "64'",
  },
  {
    id: "3",
    agentName: "LivePulse",
    agentColor: "var(--color-agent-live)",
    content: "58' - L'OM monte en puissance, 3 occasions en 5 minutes!",
    minute: "58'",
  },
]

export default function LivePage() {
  const [showAlert, setShowAlert] = React.useState(true)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative">
      {/* Header with Live Match */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
            </span>
            <span className="text-text-primary font-medium text-sm">
              {MOCK_MATCH.homeTeam} vs {MOCK_MATCH.awayTeam} • {MOCK_MATCH.minute}&apos;
            </span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            {MOCK_MATCH.homeScore} - {MOCK_MATCH.awayScore}
          </span>
        </div>
      </header>

      {/* Main Content (blurred when alert is shown) */}
      <main className={cn(
        "flex-1 p-4 pb-24 overflow-y-auto transition-all duration-300",
        showAlert && "blur-sm pointer-events-none"
      )}>
        <div className="space-y-4">
          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className="bg-bg-secondary rounded-xl p-4"
              style={{ borderLeft: `3px solid ${msg.agentColor}` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: msg.agentColor }}
                />
                <span className="font-semibold text-text-primary text-sm">
                  {msg.agentName}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{msg.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Alert Overlay */}
      {showAlert && (
        <div className="fixed bottom-24 left-4 right-4 z-30">
          <div
            className="bg-bg-secondary rounded-2xl p-6 border shadow-2xl"
            style={{
              borderColor: "var(--color-agent-scout)",
              boxShadow: "0 -10px 40px rgba(0, 255, 136, 0.2)",
            }}
          >
            {/* Alert Header */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: "var(--color-agent-scout)" }}
              />
              <div>
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  🚨 Scout a détecté
                </h3>
                <p className="text-xs text-text-secondary">Opportunité d&apos;analyse</p>
              </div>
            </div>

            {/* Alert Content */}
            <div className="text-sm text-text-secondary mb-4 leading-relaxed">
              <p className="font-semibold text-text-primary mb-2">Momentum shift détecté!</p>
              <p>
                L&apos;OM a eu 3 corners consécutifs dans les 5 dernières minutes.
                Historiquement, cela précède souvent un but dans les derbys.
              </p>
            </div>

            {/* Alert Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlert(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-semibold text-sm",
                  "bg-gradient-to-r from-accent-cyan to-[#0099CC]",
                  "text-bg-primary hover:opacity-90 transition-opacity"
                )}
              >
                Voir l&apos;analyse
              </button>
              <button
                onClick={() => setShowAlert(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 transition-colors"
              >
                Ignorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Alert Button (when alert is dismissed) */}
      {!showAlert && (
        <button
          onClick={() => setShowAlert(true)}
          className="fixed bottom-24 right-4 z-30 px-4 py-2 rounded-full bg-agent-scout text-bg-primary text-sm font-semibold shadow-lg"
        >
          🚨 1 alerte
        </button>
      )}

      <DashboardNav />
    </div>
  )
}
