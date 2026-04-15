"use client"

import { useState } from "react"
import { Header, BottomNav, type NavItem } from "~/components/shared"

export default function NavigationExamplesPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("home")
  const [notificationCount, setNotificationCount] = useState(5)

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      {/* Header */}
      <Header
        notificationCount={notificationCount}
        userName="Alex"
        onLangSwitch={() => console.log("Lang switch clicked")}
        onNotificationClick={() => {
          console.log("Notifications clicked")
          setNotificationCount(0)
        }}
        onUserClick={() => console.log("User clicked")}
      />

      {/* Main Content */}
      <main className="p-4 pb-24 space-y-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-text-primary">
              Navigation Components
            </h1>
            <p className="font-body text-base text-text-secondary">
              Header et BottomNav avec animations
            </p>
          </div>

          {/* Current Page Indicator */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-cyan pl-4">
              Page active: {activeNav}
            </h2>
            <p className="text-text-secondary">
              Cliquez sur les éléments de navigation en bas pour changer de page.
              Le haptic feedback est activé sur mobile.
            </p>
          </section>

          {/* Header Variants */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-orange pl-4">
              Header - Variantes
            </h2>

            <div className="space-y-4">
              {/* Default Header */}
              <div className="bg-bg-secondary rounded-lg overflow-hidden">
                <p className="text-text-tertiary text-xs px-4 pt-2 uppercase tracking-wider">
                  Avec notifications
                </p>
                <Header
                  notificationCount={12}
                  userName="Marie"
                />
              </div>

              {/* No notifications */}
              <div className="bg-bg-secondary rounded-lg overflow-hidden">
                <p className="text-text-tertiary text-xs px-4 pt-2 uppercase tracking-wider">
                  Sans notifications
                </p>
                <Header
                  notificationCount={0}
                  userName="Jean"
                />
              </div>

              {/* High count */}
              <div className="bg-bg-secondary rounded-lg overflow-hidden">
                <p className="text-text-tertiary text-xs px-4 pt-2 uppercase tracking-wider">
                  99+ notifications
                </p>
                <Header
                  notificationCount={150}
                  userName="Admin"
                />
              </div>
            </div>
          </section>

          {/* Animation Info */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-green pl-4">
              Animations
            </h2>

            <div className="bg-bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-accent-cyan">•</span>
                <span className="text-text-secondary">
                  <strong className="text-text-primary">Tap scale:</strong> 1 → 1.15 → 1 (150ms)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent-orange">•</span>
                <span className="text-text-secondary">
                  <strong className="text-text-primary">Indicator:</strong> Spring physics slide
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent-green">•</span>
                <span className="text-text-secondary">
                  <strong className="text-text-primary">Haptic:</strong> 10ms vibration (mobile)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent-gold">•</span>
                <span className="text-text-secondary">
                  <strong className="text-text-primary">Safe area:</strong> env(safe-area-inset-bottom)
                </span>
              </div>
            </div>
          </section>

          {/* Notification Badge Controls */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-gold pl-4">
              Contrôles
            </h2>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setNotificationCount((c) => c + 1)}
                className="px-4 py-2 bg-accent-cyan text-bg-primary font-semibold rounded-lg min-h-[44px]"
              >
                + Notification
              </button>
              <button
                onClick={() => setNotificationCount(0)}
                className="px-4 py-2 bg-bg-secondary text-text-primary font-semibold rounded-lg min-h-[44px]"
              >
                Clear
              </button>
              <button
                onClick={() => setNotificationCount(100)}
                className="px-4 py-2 bg-accent-red text-white font-semibold rounded-lg min-h-[44px]"
              >
                Set 100
              </button>
            </div>
          </section>

          {/* Spacer for BottomNav */}
          <div className="h-32" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeItem={activeNav} onNavigate={setActiveNav} />
    </div>
  )
}
