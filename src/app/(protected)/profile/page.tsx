"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"

// Mock user data
const MOCK_USER = {
  username: "swabo",
  memberSince: "Mars 2026",
  isPremium: true,
  isExpert: true,
  stats: {
    analyses: 127,
    wins: 89,
    winRate: 70,
  },
  rooms: {
    created: 3,
    createdSubscribers: 1200,
    subscribed: 5,
  },
}

export default function ProfilePage() {
  useSession() // Verify auth
  const router = useRouter()
  const [darkMode, setDarkMode] = React.useState(true)
  const [notifications, setNotifications] = React.useState(true)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-11"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Profil</span>
          </button>
          <button className="px-3 py-1.5 bg-bg-secondary rounded-full text-xs text-text-secondary flex items-center gap-1">
            🌐 FR
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Profile Header */}
        <div className="text-center py-6">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-cyan to-accent-orange flex items-center justify-center mb-4">
            <span className="text-3xl">📷</span>
          </div>

          {/* Username */}
          <h1 className="font-display text-xl font-semibold text-text-primary mb-1">
            @{MOCK_USER.username}
          </h1>
          <p className="text-xs text-text-secondary mb-3">
            Membre depuis {MOCK_USER.memberSince}
          </p>

          {/* Badges */}
          <div className="flex justify-center gap-2">
            {MOCK_USER.isPremium && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-gold to-[#FFB300] text-black">
                ⭐ Premium
              </span>
            )}
            {MOCK_USER.isExpert && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-agent-context text-white">
                🏅 Expert
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-accent-cyan">
              {MOCK_USER.stats.analyses}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Analyses</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-accent-cyan">
              {MOCK_USER.stats.wins}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Gagnants</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-accent-cyan">
              {MOCK_USER.stats.winRate}%
            </p>
            <p className="text-xs text-text-tertiary mt-1">Taux</p>
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>🏠</span>
            Mes salles
          </h2>

          <div className="space-y-2">
            <MenuItem
              icon="📌"
              label={`Créées (${MOCK_USER.rooms.created})`}
              subtitle={`${(MOCK_USER.rooms.createdSubscribers / 1000).toFixed(1)}K abonnés total`}
              onClick={() => router.push("/salles")}
            />
            <MenuItem
              icon="⭐"
              label={`Abonnées (${MOCK_USER.rooms.subscribed})`}
              onClick={() => router.push("/salles")}
            />
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>⚙️</span>
            Paramètres
          </h2>

          <div className="space-y-2">
            <ToggleMenuItem
              icon="🌙"
              label="Mode Sombre"
              checked={darkMode}
              onChange={setDarkMode}
            />
            <ToggleMenuItem
              icon="🔔"
              label="Notifications"
              checked={notifications}
              onChange={setNotifications}
            />
            <MenuItem
              icon="📊"
              label="Mode par défaut"
              value="Analytique"
              onClick={() => router.push("/settings/account")}
            />
          </div>
        </div>

        {/* Other Links */}
        <div className="space-y-2">
          <MenuItem
            icon="🎁"
            label="Parrainage"
            onClick={() => router.push("/referral")}
          />
          <MenuItem
            icon="💎"
            label="Abonnement"
            onClick={() => router.push("/subscription")}
          />
          <MenuItem
            icon="❓"
            label="Centre d'aide"
            onClick={() => router.push("/help")}
          />
        </div>

        {/* Logout */}
        <button
          className="w-full mt-6 py-3 bg-bg-secondary rounded-xl text-accent-red font-medium text-sm hover:bg-bg-tertiary transition-colors"
        >
          Se déconnecter
        </button>

        {/* Version */}
        <p className="text-center text-text-tertiary text-xs mt-4">
          BetAnalytic v0.1.0
        </p>
      </main>

      <DashboardNav />
    </div>
  )
}

// Menu Item Component
interface MenuItemProps {
  icon: string
  label: string
  subtitle?: string
  value?: string
  onClick: () => void
}

function MenuItem({ icon, label, subtitle, value, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-lg">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-medium text-text-primary text-sm">{label}</p>
          {subtitle && (
            <p className="text-xs text-text-tertiary">{subtitle}</p>
          )}
        </div>
      </div>
      {value ? (
        <span className="text-text-secondary text-sm">{value} →</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-text-tertiary" />
      )}
    </button>
  )
}

// Toggle Menu Item Component
interface ToggleMenuItemProps {
  icon: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleMenuItem({ icon, label, checked, onChange }: ToggleMenuItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-lg">
          {icon}
        </div>
        <span className="font-medium text-text-primary text-sm">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-7 rounded-full relative transition-colors",
          checked ? "bg-accent-cyan" : "bg-bg-tertiary"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  )
}
