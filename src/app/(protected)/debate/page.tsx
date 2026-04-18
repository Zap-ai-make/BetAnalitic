"use client"

/**
 * Epic 8: DebateArena Page
 * Showcase real-time agent debates
 */

import * as React from "react"
import { DebateArenaInvocation } from "~/components/features/debate/DebateArenaInvocation"
import { DebateArena } from "~/components/features/debate/DebateArena"
import { ExpertDebateCreator } from "~/components/features/debate/ExpertDebateCreator"
import { useDebateArenaStore } from "~/stores/debateArena"
import { Sparkles, Trophy, Users } from "lucide-react"

export default function DebatePage() {
  const { currentDebate, isDebating, debateHistory } = useDebateArenaStore()

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-accent-cyan/10 to-accent-purple/10 border-b border-bg-tertiary">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent-cyan animate-pulse" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              ⚔️ DebateArena
            </h1>
            <Sparkles className="w-8 h-8 text-accent-purple animate-pulse" />
          </div>
          <p className="text-center text-text-secondary max-w-2xl mx-auto">
            Déclenchez un débat épique entre deux agents IA. Regardez-les argumenter
            en temps réel avec des données, de l&apos;intelligence et de la stratégie.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Start Section */}
        <section className="bg-bg-secondary rounded-2xl p-6 border border-bg-tertiary">
          <h2 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent-gold" />
            Lancer un Débat
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Choisissez votre mode de débat : automatique avec sélection intelligente
            ou personnalisé (Experts uniquement)
          </p>

          <div className="flex flex-wrap gap-3">
            <DebateArenaInvocation
              matchId="match-demo"
              matchLabel="PSG vs OM • Ligue 1"
            />
            <ExpertDebateCreator
              matchId="match-custom"
              matchLabel="Real Madrid vs Barcelona • El Clásico"
              isExpert={false}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-cyan" />
            Comment ça marche ?
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-base text-text-primary mb-2">
                Sélection Intelligente
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Le système choisit automatiquement deux agents avec des perspectives
                opposées : Scout vs Insider (data vs intel), GoalMaster vs WallMaster
                (attaque vs défense).
              </p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center mb-3">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="font-semibold text-base text-text-primary mb-2">
                Débat Immersif
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                6 échanges tour par tour avec pauses dramatiques de 8-10s. Effet
                typewriter, messages glissant depuis les côtés, zone d&apos;interaction
                bloquée pendant le débat.
              </p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
              <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-base text-text-primary mb-2">
                Verdict Spectaculaire
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Animation gavel, scores en pourcentage, résumé des arguments clés.
                L&apos;agent gagnant est déterminé par la force de ses arguments.
              </p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
              <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center mb-3">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="font-semibold text-base text-text-primary mb-2">
                Mode Expert (Premium)
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Les Experts peuvent créer des scénarios personnalisés : choisir les
                agents, définir le sujet, publier dans leur salle pour leur audience.
              </p>
            </div>
          </div>
        </section>

        {/* Debate History */}
        {debateHistory.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-accent-purple" />
              Débats Récents
            </h2>

            <div className="space-y-3">
              {debateHistory.slice(0, 5).map((debate) => (
                <div
                  key={debate.id}
                  className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-text-primary mb-1">
                        {debate.topic}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <span
                          className="font-semibold"
                          style={{ color: debate.agent1.color }}
                        >
                          {debate.agent1.name}
                        </span>
                        <span>vs</span>
                        <span
                          className="font-semibold"
                          style={{ color: debate.agent2.color }}
                        >
                          {debate.agent2.name}
                        </span>
                        <span>•</span>
                        <span>{debate.messages.length} échanges</span>
                      </div>
                    </div>
                    {debate.verdict && (
                      <div className="text-right">
                        <p className="text-xs text-text-tertiary mb-1">Vainqueur</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-accent-gold" />
                          <span className="text-sm font-semibold text-text-primary">
                            {debate.verdict.winner === debate.agent1.id
                              ? debate.agent1.name
                              : debate.agent2.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Status */}
        {currentDebate && (
          <div className="fixed bottom-24 inset-x-4 max-w-md mx-auto">
            <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl p-4 backdrop-blur-sm animate-pulse">
              <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                Débat en cours
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {currentDebate.agent1.name} vs {currentDebate.agent2.name} •{" "}
                {currentDebate.messages.length} échanges
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DebateArena Overlay */}
      {isDebating && <DebateArena />}
    </div>
  )
}
