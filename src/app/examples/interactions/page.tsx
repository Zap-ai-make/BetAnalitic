"use client"

import { useState, useCallback } from "react"
import { Typewriter } from "~/components/ui/Typewriter"
import { Skeleton, SkeletonText, SkeletonCard } from "~/components/ui/Skeleton"
import { PullToRefresh } from "~/components/ui/PullToRefresh"
import { StaggeredList } from "~/components/ui/StaggeredList"

const SAMPLE_TEXT = `Analyse du match PSG vs OM. Le Paris Saint-Germain affiche une forme exceptionnelle avec 5 victoires consécutives! L'OM, en revanche, peine en déplacement...`

const SAMPLE_ITEMS = [
  { id: "1", title: "PSG vs OM", status: "LIVE" },
  { id: "2", title: "Real vs Barça", status: "15:00" },
  { id: "3", title: "Bayern vs Dortmund", status: "18:30" },
  { id: "4", title: "Liverpool vs Man City", status: "21:00" },
  { id: "5", title: "Juventus vs Inter", status: "20:45" },
]

export default function InteractionsExamplesPage() {
  const [typewriterKey, setTypewriterKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [listKey, setListKey] = useState(0)

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setListKey((k) => k + 1)
  }, [])

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg-primary text-text-primary font-body p-8 pb-24">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Micro-Interactions Library
          </h1>
          <p className="font-body text-base text-text-secondary">
            Typewriter, Skeleton, PullToRefresh, StaggeredList
          </p>
        </div>

        {/* Typewriter */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-cyan pl-4">
            Typewriter Effect
          </h2>

          <div className="bg-bg-secondary rounded-lg p-6 space-y-4">
            <div className="text-text-secondary text-sm space-y-1">
              <p>• Speed: 30ms par caractère</p>
              <p>• Pause ponctuation: +100ms</p>
              <p>• Curseur clignotant</p>
            </div>

            <div className="bg-bg-tertiary rounded-lg p-4 min-h-[100px]">
              <Typewriter
                key={typewriterKey}
                text={SAMPLE_TEXT}
                speed={30}
                punctuationPause={100}
                className="text-text-primary leading-relaxed"
              />
            </div>

            <button
              onClick={() => setTypewriterKey((k) => k + 1)}
              className="px-4 py-2 bg-accent-cyan text-bg-primary font-semibold rounded-lg min-h-[44px]"
            >
              Rejouer
            </button>
          </div>
        </section>

        {/* Skeleton */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-orange pl-4">
            Skeleton Loading
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={simulateLoading}
                className="px-4 py-2 bg-accent-orange text-bg-primary font-semibold rounded-lg min-h-[44px]"
              >
                Simuler chargement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skeleton variants */}
              <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
                <p className="text-text-tertiary text-xs uppercase tracking-wider">
                  Shimmer (1.5s loop)
                </p>
                {isLoading ? (
                  <SkeletonCard />
                ) : (
                  <div className="bg-bg-tertiary rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                        <span>⚽</span>
                      </div>
                      <div>
                        <p className="font-semibold">PSG vs OM</p>
                        <p className="text-text-tertiary text-sm">20:45</p>
                      </div>
                    </div>
                    <p className="mt-3 text-text-secondary text-sm">
                      Match de Ligue 1 très attendu entre les deux rivaux.
                    </p>
                  </div>
                )}
              </div>

              {/* Text skeleton */}
              <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
                <p className="text-text-tertiary text-xs uppercase tracking-wider">
                  Text Lines
                </p>
                {isLoading ? (
                  <SkeletonText lines={4} />
                ) : (
                  <div className="space-y-2 text-text-secondary text-sm">
                    <p>Ligne de texte 1</p>
                    <p>Ligne de texte 2</p>
                    <p>Ligne de texte 3</p>
                    <p className="w-3/4">Ligne de texte 4</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skeleton types */}
            <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
              <p className="text-text-tertiary text-xs uppercase tracking-wider">
                Variants
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="space-y-1">
                  <Skeleton variant="text" width={120} />
                  <p className="text-text-tertiary text-xs">Text</p>
                </div>
                <div className="space-y-1">
                  <Skeleton variant="circular" width={48} height={48} />
                  <p className="text-text-tertiary text-xs">Circular</p>
                </div>
                <div className="space-y-1">
                  <Skeleton variant="rectangular" width={100} height={60} />
                  <p className="text-text-tertiary text-xs">Rectangular</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pull to Refresh */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-green pl-4">
            Pull-to-Refresh (Mobile)
          </h2>

          <div className="bg-bg-secondary rounded-lg overflow-hidden">
            <p className="text-text-tertiary text-xs px-4 pt-4 uppercase tracking-wider">
              Tirez vers le bas pour rafraîchir (touch uniquement)
            </p>
            <PullToRefresh
              onRefresh={handleRefresh}
              className="h-[300px] p-4"
            >
              <StaggeredList
                items={SAMPLE_ITEMS}
                keyExtractor={(item) => item.id}
                refreshKey={listKey}
                staggerDelay={80}
                renderItem={(item) => (
                  <div className="bg-bg-tertiary rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚽</span>
                      <span className="font-semibold text-text-primary">
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={
                        item.status === "LIVE"
                          ? "text-accent-red font-bold"
                          : "text-text-tertiary"
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                )}
              />
            </PullToRefresh>
          </div>

          <div className="bg-bg-secondary rounded-lg p-4 space-y-2">
            <p className="text-text-tertiary text-xs uppercase tracking-wider">
              Comportement
            </p>
            <div className="text-text-secondary text-sm space-y-1">
              <p>• Indicator proportionnel au pull</p>
              <p>• Icône rotation 0° → 180°</p>
              <p>• Success → checkmark morph</p>
              <p>• Liste stagger refresh (80ms delay)</p>
            </div>
          </div>
        </section>

        {/* Staggered List */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-gold pl-4">
            Staggered List Animation
          </h2>

          <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
            <button
              onClick={() => setListKey((k) => k + 1)}
              className="px-4 py-2 bg-accent-gold text-bg-primary font-semibold rounded-lg min-h-[44px]"
            >
              Rejouer animation
            </button>

            <StaggeredList
              items={SAMPLE_ITEMS}
              keyExtractor={(item) => item.id}
              refreshKey={listKey}
              staggerDelay={100}
              animationDuration={400}
              renderItem={(item) => (
                <div className="bg-bg-tertiary rounded-lg p-4 flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    {item.title}
                  </span>
                  <span className="text-text-tertiary">{item.status}</span>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
