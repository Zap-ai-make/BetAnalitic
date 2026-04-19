"use client"

/**
 * Epic 10 Story 10.9: Expert Track Record Display
 * Display expert performance metrics and track record
 */

import * as React from "react"
import { TrendingUp, Target, Calendar, Trophy, Award } from "lucide-react"
import { cn } from "~/lib/utils"

interface ExpertTrackRecordProps {
  expertId: string
  stats: {
    totalPredictions: number
    winRate: number
    averageOdds: number
    profitLoss: number
    streak: number
    streakType: "win" | "loss"
    bestStreak: number
    recentForm: ("W" | "L" | "D")[]
    expertiseAreas: string[]
    memberSince: Date
    totalFollowers: number
    totalSubscribers: number
  }
  className?: string
}

export function ExpertTrackRecord({ stats, className }: ExpertTrackRecordProps) {
  const winRateColor = stats.winRate >= 60 ? "text-accent-green" : stats.winRate >= 50 ? "text-accent-orange" : "text-accent-red"
  const plColor = stats.profitLoss >= 0 ? "text-accent-green" : "text-accent-red"

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Taux de réussite"
          value={`${stats.winRate}%`}
          valueColor={winRateColor}
          iconColor="text-accent-cyan"
          iconBg="bg-accent-cyan/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Profit/Perte"
          value={`${stats.profitLoss >= 0 ? "+" : ""}${stats.profitLoss.toFixed(1)}%`}
          valueColor={plColor}
          iconColor={plColor}
          iconBg={stats.profitLoss >= 0 ? "bg-accent-green/20" : "bg-accent-red/20"}
        />
        <StatCard
          icon={Trophy}
          label="Série actuelle"
          value={`${stats.streak} ${stats.streakType === "win" ? "V" : "D"}`}
          valueColor={stats.streakType === "win" ? "text-accent-green" : "text-accent-red"}
          iconColor="text-accent-gold"
          iconBg="bg-accent-gold/20"
        />
        <StatCard
          icon={Award}
          label="Meilleure série"
          value={`${stats.bestStreak} V`}
          valueColor="text-accent-purple"
          iconColor="text-accent-purple"
          iconBg="bg-accent-purple/20"
        />
      </div>

      {/* Recent Form */}
      <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
        <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-cyan" />
          Forme récente (10 derniers)
        </h3>
        <div className="flex gap-2">
          {stats.recentForm.map((result, idx) => (
            <div
              key={idx}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                result === "W"
                  ? "bg-accent-green/20 text-accent-green"
                  : result === "L"
                    ? "bg-accent-red/20 text-accent-red"
                    : "bg-bg-tertiary text-text-tertiary"
              )}
              title={result === "W" ? "Victoire" : result === "L" ? "Défaite" : "Nul"}
            >
              {result}
            </div>
          ))}
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
        <h3 className="font-display font-bold text-text-primary mb-4">
          Domaines d&apos;expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {stats.expertiseAreas.map((area) => (
            <span
              key={area}
              className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-xl text-sm font-semibold"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
          <p className="text-2xl font-display font-bold text-text-primary">
            {stats.totalPredictions}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Pronostics</p>
        </div>
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
          <p className="text-2xl font-display font-bold text-text-primary">
            {stats.totalFollowers}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Abonnés</p>
        </div>
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
          <p className="text-2xl font-display font-bold text-text-primary">
            {stats.totalSubscribers}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Payants</p>
        </div>
      </div>

      {/* Member Since */}
      <div className="text-center text-sm text-text-tertiary">
        Expert vérifié depuis {stats.memberSince.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long"
        })}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  valueColor: string
  iconColor: string
  iconBg: string
}

function StatCard({ icon: Icon, label, value, valueColor, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className={cn("text-2xl font-display font-bold", valueColor)}>{value}</p>
    </div>
  )
}
