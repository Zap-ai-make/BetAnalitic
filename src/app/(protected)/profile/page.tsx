"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  // Analysis preferences
  const [expertiseLevel, setExpertiseLevel] = React.useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">("INTERMEDIATE")
  const [analysisDepth, setAnalysisDepth] = React.useState<"QUICK" | "STANDARD" | "DETAILED">("STANDARD")

  // Load preferences from localStorage
  React.useEffect(() => {
    const savedExpertiseLevel = localStorage.getItem("expertiseLevel") as typeof expertiseLevel | null
    const savedAnalysisDepth = localStorage.getItem("analysisDepth") as typeof analysisDepth | null
    if (savedExpertiseLevel) setExpertiseLevel(savedExpertiseLevel)
    if (savedAnalysisDepth) setAnalysisDepth(savedAnalysisDepth)
  }, [])

  // Save preferences to localStorage
  React.useEffect(() => {
    localStorage.setItem("expertiseLevel", expertiseLevel)
  }, [expertiseLevel])

  React.useEffect(() => {
    localStorage.setItem("analysisDepth", analysisDepth)
  }, [analysisDepth])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Clear local storage
      localStorage.clear()
      // Clear session storage
      sessionStorage.clear()
      // Sign out and redirect to login
      await signOut({ callbackUrl: "/login", redirect: true })
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

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

        {/* Analysis Preferences Section */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>🎯</span>
            Préférences d&apos;Analyse
          </h2>

          <div className="space-y-2">
            <SelectMenuItem
              icon="📚"
              label="Niveau d'Expertise"
              value={expertiseLevel}
              options={[
                { value: "BEGINNER", label: "Débutant", subtitle: "Explications simples et détaillées" },
                { value: "INTERMEDIATE", label: "Intermédiaire", subtitle: "Équilibre entre détail et concision" },
                { value: "EXPERT", label: "Expert", subtitle: "Données denses, concepts avancés" },
              ]}
              onChange={(value) => setExpertiseLevel(value as typeof expertiseLevel)}
            />
            <SelectMenuItem
              icon="📊"
              label="Profondeur d'Analyse"
              value={analysisDepth}
              options={[
                { value: "QUICK", label: "Rapide", subtitle: "Insights clés uniquement" },
                { value: "STANDARD", label: "Standard", subtitle: "Analyse équilibrée" },
                { value: "DETAILED", label: "Détaillée", subtitle: "Analyse complète et approfondie" },
              ]}
              onChange={(value) => setAnalysisDepth(value as typeof analysisDepth)}
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
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full mt-6 py-3 bg-bg-secondary rounded-xl text-accent-red font-medium text-sm hover:bg-bg-tertiary transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
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

// Select Menu Item Component
interface SelectMenuItemProps {
  icon: string
  label: string
  value: string
  options: Array<{ value: string; label: string; subtitle?: string }>
  onChange: (value: string) => void
}

function SelectMenuItem({ icon, label, value, options, onChange }: SelectMenuItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const currentOption = options.find((opt) => opt.value === value)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-lg">
            {icon}
          </div>
          <div className="text-left">
            <p className="font-medium text-text-primary text-sm">{label}</p>
            <p className="text-xs text-text-tertiary">{currentOption?.label}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-text-tertiary" />
      </button>

      {/* Selection Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary rounded-t-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-text-primary">
                {label}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full p-4 rounded-lg text-left transition-colors",
                    value === option.value
                      ? "bg-accent-cyan/20 border-2 border-accent-cyan"
                      : "bg-bg-primary border-2 border-transparent hover:border-bg-tertiary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {option.label}
                      </p>
                      {option.subtitle && (
                        <p className="text-xs text-text-tertiary mt-1">
                          {option.subtitle}
                        </p>
                      )}
                    </div>
                    {value === option.value && (
                      <div className="text-accent-cyan text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
