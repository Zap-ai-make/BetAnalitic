"use client"

/**
 * Epic 10 Story 10.4: Expert Dashboard & Analytics
 * Analytics dashboard for verified experts
 */

import * as React from "react"
import {
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  ArrowLeft,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function ExpertDashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d" | "all">("30d")

  // Query expert profile and stats
  const { data: expertProfile } = api.expert.getMyExpertProfile.useQuery()

  // TODO: Add analytics queries when backend is ready
  // const { data: analytics } = api.expert.getAnalytics.useQuery({ timeRange })

  // Mock data for now
  const mockAnalytics = {
    revenue: {
      total: 1247.50,
      monthly: 450.00,
      growth: 23,
    },
    followers: {
      total: expertProfile?.followerCount ?? 0,
      growth: 12,
      newThisMonth: 45,
    },
    subscribers: {
      total: expertProfile?.subscriberCount ?? 0,
      growth: 8,
      newThisMonth: 15,
      churnRate: 2.3,
    },
    content: {
      total: expertProfile?.contentCount ?? 0,
      published: 12,
      views: 3420,
      engagement: 68,
    },
    topContent: [
      { id: "1", title: "PSG vs OM - Analyse tactique", views: 845, likes: 124, comments: 32 },
      { id: "2", title: "Ligue 1 - Pronostics J15", views: 672, likes: 98, comments: 24 },
      { id: "3", title: "Champions League Predictions", views: 534, likes: 87, comments: 19 },
    ],
  }

  if (!expertProfile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            Accès refusé
          </h1>
          <p className="text-text-secondary mb-4">
            Cette page est réservée aux experts vérifiés.
          </p>
          <button
            onClick={() => router.push("/expert/apply")}
            className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors"
          >
            Devenir Expert
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-accent-gold animate-pulse" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Tableau de Bord Expert
            </h1>
          </div>
          <p className="text-text-secondary">
            Vue d&apos;ensemble de vos performances et revenus
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Time Range Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-bg-tertiary">
            <button
              onClick={() => setTimeRange("7d")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                timeRange === "7d"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              7 jours
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                timeRange === "30d"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              30 jours
            </button>
            <button
              onClick={() => setTimeRange("90d")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                timeRange === "90d"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              90 jours
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                timeRange === "all"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Tout
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-xl border border-bg-tertiary text-text-primary hover:bg-bg-tertiary transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Exporter</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Revenus mensuels"
            value={`${mockAnalytics.revenue.monthly.toFixed(2)}€`}
            growth={mockAnalytics.revenue.growth}
            iconColor="text-accent-green"
            iconBg="bg-accent-green/20"
          />
          <MetricCard
            icon={Users}
            label="Abonnés payants"
            value={mockAnalytics.subscribers.total}
            growth={mockAnalytics.subscribers.growth}
            iconColor="text-accent-purple"
            iconBg="bg-accent-purple/20"
            subtitle={`+${mockAnalytics.subscribers.newThisMonth} ce mois`}
          />
          <MetricCard
            icon={Heart}
            label="Followers"
            value={mockAnalytics.followers.total}
            growth={mockAnalytics.followers.growth}
            iconColor="text-accent-orange"
            iconBg="bg-accent-orange/20"
            subtitle={`+${mockAnalytics.followers.newThisMonth} ce mois`}
          />
          <MetricCard
            icon={FileText}
            label="Contenus publiés"
            value={mockAnalytics.content.published}
            iconColor="text-accent-cyan"
            iconBg="bg-accent-cyan/20"
            subtitle={`${mockAnalytics.content.total} total`}
          />
        </div>

        {/* Revenue Overview */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Aperçu des revenus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Revenus totaux</p>
              <p className="text-2xl font-display font-bold text-accent-green">
                {mockAnalytics.revenue.total.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Ce mois</p>
              <p className="text-2xl font-display font-bold text-text-primary">
                {mockAnalytics.revenue.monthly.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Taux de churn</p>
              <p className="text-2xl font-display font-bold text-accent-red">
                {mockAnalytics.subscribers.churnRate}%
              </p>
            </div>
          </div>

          <div className="mt-6 h-48 bg-bg-tertiary rounded-xl flex items-center justify-center text-text-tertiary">
            <p className="text-sm">Graphique de revenus (à venir)</p>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-text-primary">
              Performances des contenus
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent-cyan" />
                <span className="text-text-secondary">
                  {mockAnalytics.content.views} vues
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-green" />
                <span className="text-text-secondary">
                  {mockAnalytics.content.engagement}% engagement
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {mockAnalytics.topContent.map((content, idx) => (
              <div
                key={content.id}
                className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-xl hover:bg-bg-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold text-sm">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary text-sm">{content.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {content.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {content.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {content.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriber Analytics */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Analyse des abonnés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Abonnés actifs</span>
                <span className="font-semibold text-text-primary">
                  {mockAnalytics.subscribers.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Nouveaux ce mois</span>
                <span className="font-semibold text-accent-green">
                  +{mockAnalytics.subscribers.newThisMonth}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Taux de rétention</span>
                <span className="font-semibold text-accent-cyan">
                  {(100 - mockAnalytics.subscribers.churnRate).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-32 bg-bg-tertiary rounded-xl flex items-center justify-center text-text-tertiary">
              <p className="text-sm">Graphique croissance (à venir)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  growth?: number
  subtitle?: string
  iconColor: string
  iconBg: string
}

function MetricCard({
  icon: Icon,
  label,
  value,
  growth,
  subtitle,
  iconColor,
  iconBg,
}: MetricCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl p-5 border border-bg-tertiary">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {growth !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              growth >= 0
                ? "bg-accent-green/20 text-accent-green"
                : "bg-accent-red/20 text-accent-red"
            )}
          >
            <TrendingUp className={cn("w-3 h-3", growth < 0 && "rotate-180")} />
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-text-primary mb-1">{value}</p>
      {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
    </div>
  )
}
