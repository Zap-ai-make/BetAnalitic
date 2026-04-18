"use client"

/**
 * Epic 11 Story 11.8: User Preferences & Personalization
 * Comprehensive preferences and personalization settings
 */

import * as React from "react"
import {
  Settings,
  User,
  Bell,
  Globe,
  Target,
  ArrowLeft,
  Save,
  RotateCcw,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function PreferencesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"content" | "notifications" | "recommendations">("content")
  const [hasChanges, setHasChanges] = React.useState(false)

  // Query
  const { data: prefs, refetch } = api.preferences.getPreferences.useQuery()
  const { data: recommendations } = api.preferences.getRecommendations.useQuery()

  // Local state for form
  const [expertiseLevel, setExpertiseLevel] = React.useState(prefs?.user.expertiseLevel ?? "BEGINNER")
  const [analysisDepth, setAnalysisDepth] = React.useState(prefs?.user.analysisDepth ?? "STANDARD")
  const [language, setLanguage] = React.useState(prefs?.user.language ?? "fr")
  const [favoriteSports, setFavoriteSports] = React.useState<string[]>(prefs?.user.favoriteSports ?? [])

  const [pushEnabled, setPushEnabled] = React.useState(prefs?.notifications.pushEnabled ?? true)
  const [emailDigest, setEmailDigest] = React.useState(prefs?.notifications.emailDigest ?? "NONE")
  const [matchAlerts, setMatchAlerts] = React.useState(prefs?.notifications.matchAlerts ?? true)
  const [agentAlerts, setAgentAlerts] = React.useState(prefs?.notifications.agentAlerts ?? true)
  const [roomAlerts, setRoomAlerts] = React.useState(prefs?.notifications.roomAlerts ?? true)
  const [dndEnabled, setDndEnabled] = React.useState(prefs?.notifications.dndEnabled ?? false)

  // Sync with fetched data
  React.useEffect(() => {
    if (prefs) {
      setExpertiseLevel(prefs.user.expertiseLevel)
      setAnalysisDepth(prefs.user.analysisDepth)
      setLanguage(prefs.user.language)
      setFavoriteSports(prefs.user.favoriteSports)
      setPushEnabled(prefs.notifications.pushEnabled)
      setEmailDigest(prefs.notifications.emailDigest)
      setMatchAlerts(prefs.notifications.matchAlerts)
      setAgentAlerts(prefs.notifications.agentAlerts)
      setRoomAlerts(prefs.notifications.roomAlerts)
      setDndEnabled(prefs.notifications.dndEnabled)
    }
  }, [prefs])

  // Mutations
  const updateContentMutation = api.preferences.updateContentPreferences.useMutation({
    onSuccess: () => {
      void refetch()
      setHasChanges(false)
    },
  })

  const updateNotificationsMutation = api.preferences.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      void refetch()
      setHasChanges(false)
    },
  })

  const resetMutation = api.preferences.resetPreferences.useMutation({
    onSuccess: () => {
      void refetch()
      setHasChanges(false)
    },
  })

  const handleSaveContent = async () => {
    await updateContentMutation.mutateAsync({
      expertiseLevel,
      analysisDepth,
      language,
      favoriteSports,
    })
  }

  const handleSaveNotifications = async () => {
    await updateNotificationsMutation.mutateAsync({
      pushEnabled,
      emailDigest,
      matchAlerts,
      agentAlerts,
      roomAlerts,
      dndEnabled,
    })
  }

  const handleReset = async () => {
    if (confirm("Réinitialiser toutes les préférences ? Cette action est irréversible.")) {
      await resetMutation.mutateAsync()
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 border-b border-bg-tertiary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-accent-purple" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Préférences
            </h1>
          </div>
          <p className="text-text-secondary">
            Personnalisez votre expérience sur la plateforme
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "content"}
              onClick={() => setActiveTab("content")}
              icon={User}
              label="Contenu"
            />
            <TabButton
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
              icon={Bell}
              label="Notifications"
            />
            <TabButton
              active={activeTab === "recommendations"}
              onClick={() => setActiveTab("recommendations")}
              icon={Target}
              label="Recommandations"
            />
          </div>
        </div>

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Expertise Level */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Niveau d&apos;expertise
              </h2>
              <div className="space-y-2">
                <OptionButton
                  active={expertiseLevel === "BEGINNER"}
                  onClick={() => {
                    setExpertiseLevel("BEGINNER")
                    setHasChanges(true)
                  }}
                  title="Débutant"
                  description="Analyses simplifiées et recommandations guidées"
                />
                <OptionButton
                  active={expertiseLevel === "INTERMEDIATE"}
                  onClick={() => {
                    setExpertiseLevel("INTERMEDIATE")
                    setHasChanges(true)
                  }}
                  title="Intermédiaire"
                  description="Équilibre entre détails et accessibilité"
                />
                <OptionButton
                  active={expertiseLevel === "EXPERT"}
                  onClick={() => {
                    setExpertiseLevel("EXPERT")
                    setHasChanges(true)
                  }}
                  title="Expert"
                  description="Analyses avancées et statistiques détaillées"
                />
              </div>
            </div>

            {/* Analysis Depth */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Profondeur d&apos;analyse
              </h2>
              <div className="space-y-2">
                <OptionButton
                  active={analysisDepth === "QUICK"}
                  onClick={() => {
                    setAnalysisDepth("QUICK")
                    setHasChanges(true)
                  }}
                  title="Rapide"
                  description="Analyses concises pour décisions rapides"
                />
                <OptionButton
                  active={analysisDepth === "STANDARD"}
                  onClick={() => {
                    setAnalysisDepth("STANDARD")
                    setHasChanges(true)
                  }}
                  title="Standard"
                  description="Analyses équilibrées avec points clés"
                />
                <OptionButton
                  active={analysisDepth === "DETAILED"}
                  onClick={() => {
                    setAnalysisDepth("DETAILED")
                    setHasChanges(true)
                  }}
                  title="Détaillée"
                  description="Analyses approfondies avec tous les détails"
                />
              </div>
            </div>

            {/* Language */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Langue
              </h2>
              <div className="space-y-2">
                <OptionButton
                  active={language === "fr"}
                  onClick={() => {
                    setLanguage("fr")
                    setHasChanges(true)
                  }}
                  title="Français"
                  description="Interface et analyses en français"
                />
                <OptionButton
                  active={language === "en"}
                  onClick={() => {
                    setLanguage("en")
                    setHasChanges(true)
                  }}
                  title="English"
                  description="Interface and analysis in English"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveContent}
              disabled={!hasChanges || updateContentMutation.isPending}
              className="w-full p-4 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {updateContentMutation.isPending ? "Enregistrement..." : "Enregistrer les préférences"}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {/* Global Toggles */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Notifications globales
              </h2>
              <div className="space-y-4">
                <ToggleRow
                  label="Notifications push"
                  description="Recevoir des notifications push sur l'application"
                  checked={pushEnabled}
                  onChange={(checked) => {
                    setPushEnabled(checked)
                    setHasChanges(true)
                  }}
                />
                <ToggleRow
                  label="Mode Ne pas déranger"
                  description="Désactiver les notifications pendant certaines heures"
                  checked={dndEnabled}
                  onChange={(checked) => {
                    setDndEnabled(checked)
                    setHasChanges(true)
                  }}
                />
              </div>
            </div>

            {/* Specific Alerts */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Types de notifications
              </h2>
              <div className="space-y-4">
                <ToggleRow
                  label="Alertes de matchs"
                  description="Notifications pour les matchs importants et résultats"
                  checked={matchAlerts}
                  onChange={(checked) => {
                    setMatchAlerts(checked)
                    setHasChanges(true)
                  }}
                />
                <ToggleRow
                  label="Alertes agents IA"
                  description="Notifications quand les agents ont de nouvelles analyses"
                  checked={agentAlerts}
                  onChange={(checked) => {
                    setAgentAlerts(checked)
                    setHasChanges(true)
                  }}
                />
                <ToggleRow
                  label="Alertes salles"
                  description="Notifications pour l'activité dans vos salles"
                  checked={roomAlerts}
                  onChange={(checked) => {
                    setRoomAlerts(checked)
                    setHasChanges(true)
                  }}
                />
              </div>
            </div>

            {/* Email Digest */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Digest par email
              </h2>
              <div className="space-y-2">
                <OptionButton
                  active={emailDigest === "NONE"}
                  onClick={() => {
                    setEmailDigest("NONE")
                    setHasChanges(true)
                  }}
                  title="Aucun"
                  description="Pas de résumés par email"
                />
                <OptionButton
                  active={emailDigest === "DAILY"}
                  onClick={() => {
                    setEmailDigest("DAILY")
                    setHasChanges(true)
                  }}
                  title="Quotidien"
                  description="Résumé quotidien de l'activité"
                />
                <OptionButton
                  active={emailDigest === "WEEKLY"}
                  onClick={() => {
                    setEmailDigest("WEEKLY")
                    setHasChanges(true)
                  }}
                  title="Hebdomadaire"
                  description="Résumé hebdomadaire chaque lundi"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveNotifications}
              disabled={!hasChanges || updateNotificationsMutation.isPending}
              className="w-full p-4 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {updateNotificationsMutation.isPending ? "Enregistrement..." : "Enregistrer les préférences"}
            </button>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && recommendations && (
          <div className="space-y-6">
            {/* Suggested Agents */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Agents recommandés pour vous
              </h2>
              <div className="space-y-2">
                {recommendations.suggestedAgents.map((agent) => (
                  <div key={agent} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl">
                    <span className="text-text-primary font-semibold">{agent}</span>
                    <ChevronRight className="w-5 h-5 text-text-tertiary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Depth */}
            {recommendations.currentDepth !== recommendations.suggestedDepth && (
              <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg text-text-primary mb-2">
                  Suggestion de profondeur
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Basé sur votre niveau d&apos;expertise, nous recommandons la profondeur <span className="font-semibold text-accent-cyan">{recommendations.suggestedDepth}</span>
                </p>
                <button
                  onClick={() => {
                    setAnalysisDepth(recommendations.suggestedDepth as "QUICK" | "STANDARD" | "DETAILED")
                    setActiveTab("content")
                    setHasChanges(true)
                  }}
                  className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors text-sm min-h-[40px]"
                >
                  Appliquer la recommandation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="w-full p-4 bg-bg-tertiary text-text-secondary rounded-xl font-semibold hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          {resetMutation.isPending ? "Réinitialisation..." : "Réinitialiser toutes les préférences"}
        </button>
      </div>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm min-h-[40px]",
        active
          ? "bg-accent-cyan text-bg-primary"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

interface OptionButtonProps {
  active: boolean
  onClick: () => void
  title: string
  description: string
}

function OptionButton({ active, onClick, title, description }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl transition-all min-h-[60px]",
        active
          ? "bg-accent-cyan/20 border-2 border-accent-cyan"
          : "bg-bg-tertiary border-2 border-transparent hover:border-bg-primary"
      )}
    >
      <p className={cn("font-semibold mb-1", active ? "text-accent-cyan" : "text-text-primary")}>
        {title}
      </p>
      <p className="text-xs text-text-secondary">{description}</p>
    </button>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-accent-green" : "bg-bg-tertiary"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
            checked ? "left-6" : "left-0.5"
          )}
        />
      </button>
    </div>
  )
}
