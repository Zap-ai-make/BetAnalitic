"use client"

/**
 * Epic 11 Story 11.9: Re-engagement Automation
 * Admin dashboard for user engagement metrics
 */

import * as React from "react"
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function EngagementMetricsPage() {
  const router = useRouter()
  const [selectedDays, setSelectedDays] = React.useState(7)

  // Queries
  const { data: metrics, refetch, isLoading } = api.reengagement.getReengagementMetrics.useQuery()
  const { data: inactiveUsers } = api.reengagement.getInactiveUsers.useQuery({
    days: selectedDays,
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border-b border-bg-tertiary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-accent-cyan" />
                <h1 className="text-3xl font-display font-bold text-text-primary">
                  Métriques d&apos;engagement
                </h1>
              </div>
              <p className="text-text-secondary">
                Suivi de l&apos;engagement utilisateur et automatisation du ré-engagement
              </p>
            </div>

            <button
              onClick={() => void refetch()}
              className="p-3 bg-accent-cyan text-bg-primary rounded-xl hover:bg-accent-cyan/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Overview Stats */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Chargement...</p>
          </div>
        ) : metrics ? (
          <>
            {/* Total Users */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-accent-cyan" />
                <h2 className="font-display font-bold text-lg text-text-primary">
                  Total utilisateurs
                </h2>
              </div>
              <p className="text-4xl font-display font-bold text-accent-cyan">{metrics.total}</p>
            </div>

            {/* Engagement Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EngagementCard
                label="Actifs"
                count={metrics.active}
                percentage={metrics.percentages.active}
                icon={TrendingUp}
                color="text-accent-green"
                bg="bg-accent-green/20"
                description="3 derniers jours"
              />
              <EngagementCard
                label="À risque"
                count={metrics.atRisk}
                percentage={metrics.percentages.atRisk}
                icon={AlertCircle}
                color="text-accent-orange"
                bg="bg-accent-orange/20"
                description="4-7 jours"
              />
              <EngagementCard
                label="Dormants"
                count={metrics.dormant}
                percentage={metrics.percentages.dormant}
                icon={Activity}
                color="text-accent-purple"
                bg="bg-accent-purple/20"
                description="8-30 jours"
              />
              <EngagementCard
                label="Inactifs"
                count={metrics.inactive}
                percentage={metrics.percentages.inactive}
                icon={TrendingDown}
                color="text-accent-red"
                bg="bg-accent-red/20"
                description="+30 jours"
              />
            </div>

            {/* Engagement Chart */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
              <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                Distribution de l&apos;engagement
              </h2>
              <div className="h-8 bg-bg-tertiary rounded-full overflow-hidden flex">
                <div
                  className="bg-accent-green h-full"
                  style={{ width: `${metrics.percentages.active}%` }}
                  title={`Actifs: ${metrics.percentages.active}%`}
                />
                <div
                  className="bg-accent-orange h-full"
                  style={{ width: `${metrics.percentages.atRisk}%` }}
                  title={`À risque: ${metrics.percentages.atRisk}%`}
                />
                <div
                  className="bg-accent-purple h-full"
                  style={{ width: `${metrics.percentages.dormant}%` }}
                  title={`Dormants: ${metrics.percentages.dormant}%`}
                />
                <div
                  className="bg-accent-red h-full"
                  style={{ width: `${metrics.percentages.inactive}%` }}
                  title={`Inactifs: ${metrics.percentages.inactive}%`}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <LegendItem color="bg-accent-green" label="Actifs" percentage={metrics.percentages.active} />
                <LegendItem color="bg-accent-orange" label="À risque" percentage={metrics.percentages.atRisk} />
                <LegendItem color="bg-accent-purple" label="Dormants" percentage={metrics.percentages.dormant} />
                <LegendItem color="bg-accent-red" label="Inactifs" percentage={metrics.percentages.inactive} />
              </div>
            </div>
          </>
        ) : null}

        {/* Inactive Users List */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-text-primary">
              Utilisateurs inactifs
            </h2>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="px-3 py-2 bg-bg-tertiary text-text-primary rounded-xl border border-bg-tertiary focus:border-accent-cyan outline-none"
            >
              <option value={3}>3 jours</option>
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
            </select>
          </div>

          {inactiveUsers && inactiveUsers.length > 0 ? (
            <div className="space-y-2">
              {inactiveUsers.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">{user.username}</p>
                    <p className="text-xs text-text-tertiary">
                      Niveau {user.level} • {user.points} points
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent-red">
                      {user.daysSinceLastActivity} jours
                    </p>
                    <p className="text-xs text-text-tertiary capitalize">{user.engagementLevel.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-text-secondary">Aucun utilisateur inactif</p>
          )}
        </div>

        {/* Re-engagement Actions */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Actions de ré-engagement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              title="Campagne email"
              description="Envoyer des emails de ré-engagement aux utilisateurs dormants"
              buttonText="Lancer la campagne"
              color="text-accent-cyan"
            />
            <ActionCard
              title="Notifications push"
              description="Notifications ciblées pour les utilisateurs à risque"
              buttonText="Envoyer notifications"
              color="text-accent-orange"
            />
            <ActionCard
              title="Offres win-back"
              description="Bonus et récompenses pour les utilisateurs inactifs"
              buttonText="Activer les offres"
              color="text-accent-gold"
            />
            <ActionCard
              title="Analyse prédictive"
              description="Identifier les utilisateurs susceptibles de churner"
              buttonText="Analyser"
              color="text-accent-purple"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface EngagementCardProps {
  label: string
  count: number
  percentage: number
  icon: React.ElementType
  color: string
  bg: string
  description: string
}

function EngagementCard({ label, count, percentage, icon: Icon, color, bg, description }: EngagementCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className={cn("text-2xl font-display font-bold mb-1", color)}>{count}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-tertiary">{description}</p>
        <p className="text-xs font-semibold text-text-secondary">{percentage}%</p>
      </div>
    </div>
  )
}

interface LegendItemProps {
  color: string
  label: string
  percentage: number
}

function LegendItem({ color, label, percentage }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded-full", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary truncate">{label}</p>
        <p className="text-xs font-semibold text-text-primary">{percentage}%</p>
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  buttonText: string
  color: string
}

function ActionCard({ title, description, buttonText, color }: ActionCardProps) {
  return (
    <div className="p-4 bg-bg-tertiary rounded-xl">
      <h3 className={cn("font-semibold mb-2", color)}>{title}</h3>
      <p className="text-sm text-text-secondary mb-3">{description}</p>
      <button className="w-full px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors text-sm min-h-[40px]">
        {buttonText}
      </button>
    </div>
  )
}
