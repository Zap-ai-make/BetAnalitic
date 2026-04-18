"use client"

/**
 * Epic 11 Story 11.5: Achievements & Badges
 * View and track all achievements
 */

import * as React from "react"
import {
  Trophy,
  Target,
  Users,
  BookOpen,
  Star,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import type { AchievementCategory, AchievementRarity } from "~/server/api/routers/achievements"

const CATEGORY_CONFIG = {
  PREDICTION: { icon: Target, label: "Pronostics", color: "text-accent-green", bg: "bg-accent-green/20" },
  SOCIAL: { icon: Users, label: "Social", color: "text-accent-purple", bg: "bg-accent-purple/20" },
  LEARNING: { icon: BookOpen, label: "Apprentissage", color: "text-accent-cyan", bg: "bg-accent-cyan/20" },
  MILESTONE: { icon: Star, label: "Jalons", color: "text-accent-gold", bg: "bg-accent-gold/20" },
} as const

const RARITY_CONFIG = {
  COMMON: { label: "Commun", color: "text-gray-400", glow: "shadow-gray-500/20" },
  RARE: { label: "Rare", color: "text-blue-400", glow: "shadow-blue-500/30" },
  EPIC: { label: "Épique", color: "text-purple-400", glow: "shadow-purple-500/40" },
  LEGENDARY: { label: "Légendaire", color: "text-accent-gold", glow: "shadow-gold-500/50" },
} as const

export default function AchievementsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState<AchievementCategory | "ALL">("ALL")

  // Query achievements
  const { data, isLoading } = api.achievements.getAllAchievements.useQuery()

  const filteredAchievements = React.useMemo(() => {
    if (!data) return []
    if (selectedCategory === "ALL") return data.achievements
    return data.byCategory[selectedCategory] ?? []
  }, [data, selectedCategory])

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-gold/10 via-accent-purple/10 to-accent-cyan/10 border-b border-bg-tertiary">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-accent-gold" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Succès
            </h1>
          </div>
          <p className="text-text-secondary">
            Débloquez des badges en accomplissant des défis
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Débloqués" value={data.stats.unlocked} total={data.stats.total} />
            <StatCard label="Progression" value={`${data.stats.completion}%`} />
            <StatCard label="Points gagnés" value={data.stats.totalPoints} />
            <StatCard
              label="Restants"
              value={data.stats.total - data.stats.unlocked}
              color="text-text-tertiary"
            />
          </div>
        )}

        {/* Category Filters */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
          <div className="flex flex-wrap gap-2">
            <CategoryButton
              active={selectedCategory === "ALL"}
              onClick={() => setSelectedCategory("ALL")}
              label="Tous"
              count={data?.achievements.length ?? 0}
            />
            <CategoryButton
              active={selectedCategory === "PREDICTION"}
              onClick={() => setSelectedCategory("PREDICTION")}
              label="Pronostics"
              icon={Target}
              count={data?.byCategory.PREDICTION.length ?? 0}
            />
            <CategoryButton
              active={selectedCategory === "SOCIAL"}
              onClick={() => setSelectedCategory("SOCIAL")}
              label="Social"
              icon={Users}
              count={data?.byCategory.SOCIAL.length ?? 0}
            />
            <CategoryButton
              active={selectedCategory === "LEARNING"}
              onClick={() => setSelectedCategory("LEARNING")}
              label="Apprentissage"
              icon={BookOpen}
              count={data?.byCategory.LEARNING.length ?? 0}
            />
            <CategoryButton
              active={selectedCategory === "MILESTONE"}
              onClick={() => setSelectedCategory("MILESTONE")}
              label="Jalons"
              icon={Star}
              count={data?.byCategory.MILESTONE.length ?? 0}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Chargement...</p>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">Aucun succès dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  total?: number
  color?: string
}

function StatCard({ label, value, total, color = "text-accent-cyan" }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
      <p className={cn("text-2xl font-display font-bold", color)}>
        {value}
        {total !== undefined && <span className="text-text-tertiary">/{total}</span>}
      </p>
      <p className="text-xs text-text-tertiary mt-1">{label}</p>
    </div>
  )
}

interface CategoryButtonProps {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ElementType
  count: number
}

function CategoryButton({ active, onClick, label, icon: Icon, count }: CategoryButtonProps) {
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
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs",
        active ? "bg-white/20" : "bg-bg-secondary"
      )}>
        {count}
      </span>
    </button>
  )
}

interface AchievementCardProps {
  achievement: {
    id: string
    name: string
    description: string
    category: AchievementCategory
    rarity: AchievementRarity
    requirement: number
    points: number
    progress: number
    isUnlocked: boolean
    unlockedAt: Date | null
  }
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const categoryConfig = CATEGORY_CONFIG[achievement.category]
  const rarityConfig = RARITY_CONFIG[achievement.rarity]
  const CategoryIcon = categoryConfig.icon

  const progressPercentage = (achievement.progress / achievement.requirement) * 100

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-2xl border-2 p-5 transition-all",
        achievement.isUnlocked
          ? `border-${achievement.rarity === "LEGENDARY" ? "accent-gold" : "accent-cyan"} ${rarityConfig.glow} shadow-lg`
          : "border-bg-tertiary opacity-75"
      )}
    >
      {/* Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
            achievement.isUnlocked ? categoryConfig.bg : "bg-bg-tertiary"
          )}
        >
          {achievement.isUnlocked ? (
            <CategoryIcon className={cn("w-7 h-7", categoryConfig.color)} />
          ) : (
            <Lock className="w-7 h-7 text-text-tertiary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-display font-bold truncate",
              achievement.isUnlocked ? "text-text-primary" : "text-text-tertiary"
            )}>
              {achievement.name}
            </h3>
            {achievement.isUnlocked && (
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-tertiary mb-2">{achievement.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", categoryConfig.bg, categoryConfig.color)}>
              {categoryConfig.label}
            </span>
            <span className={cn("text-xs font-semibold", rarityConfig.color)}>
              {rarityConfig.label}
            </span>
            <span className="text-xs text-accent-gold font-semibold">
              +{achievement.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {!achievement.isUnlocked && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-tertiary">Progression</span>
            <span className="text-text-primary font-semibold">
              {achievement.progress} / {achievement.requirement}
            </span>
          </div>
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", categoryConfig.bg)}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Date */}
      {achievement.isUnlocked && achievement.unlockedAt && (
        <p className="text-xs text-text-tertiary text-center mt-3">
          Débloqué le {achievement.unlockedAt.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  )
}
