"use client"

/**
 * Epic 11 Story 11.7: Prediction Contests
 * View all contests and competitions
 */

import * as React from "react"
import {
  Trophy,
  Calendar,
  Users,
  Coins,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import type { ContestStatus } from "@prisma/client"

const STATUS_CONFIG = {
  UPCOMING: { label: "À venir", color: "text-accent-cyan", bg: "bg-accent-cyan/20", icon: Clock },
  ACTIVE: { label: "En cours", color: "text-accent-green", bg: "bg-accent-green/20", icon: CheckCircle },
  ENDED: { label: "Terminé", color: "text-accent-orange", bg: "bg-accent-orange/20", icon: XCircle },
  COMPLETED: { label: "Complété", color: "text-text-tertiary", bg: "bg-bg-tertiary", icon: CheckCircle },
  CANCELLED: { label: "Annulé", color: "text-accent-red", bg: "bg-accent-red/20", icon: XCircle },
} as const

export default function ContestsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = React.useState<ContestStatus | "ALL">("ALL")

  const { data: contests, isLoading } = api.contests.getContests.useQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    limit: 50,
  })

  const activeContests = contests?.filter(c => c.status === "ACTIVE") ?? []
  const upcomingContests = contests?.filter(c => c.status === "UPCOMING") ?? []
  const endedContests = contests?.filter(c => c.status === "ENDED" || c.status === "COMPLETED") ?? []

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-gold/10 to-accent-purple/10 border-b border-bg-tertiary">
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
              Concours de Pronostics
            </h1>
          </div>
          <p className="text-text-secondary">
            Participez aux concours et remportez des points
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Filter Tabs */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
              label="Tous"
              count={contests?.length ?? 0}
            />
            <FilterButton
              active={statusFilter === "ACTIVE"}
              onClick={() => setStatusFilter("ACTIVE")}
              label="En cours"
              count={activeContests.length}
            />
            <FilterButton
              active={statusFilter === "UPCOMING"}
              onClick={() => setStatusFilter("UPCOMING")}
              label="À venir"
              count={upcomingContests.length}
            />
            <FilterButton
              active={statusFilter === "ENDED"}
              onClick={() => setStatusFilter("ENDED")}
              label="Terminés"
              count={endedContests.length}
            />
          </div>
        </div>

        {/* Contests List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Chargement...</p>
          </div>
        ) : contests && contests.length > 0 ? (
          <div className="space-y-4">
            {contests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">Aucun concours disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  label: string
  count: number
}

function FilterButton({ active, onClick, label, count }: FilterButtonProps) {
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

interface ContestCardProps {
  contest: {
    id: string
    name: string
    description: string
    type: string
    status: ContestStatus
    startDate: Date
    endDate: Date
    entryFee: number
    prizePool: number
    maxParticipants: number | null
    participantCount: number
  }
}

function ContestCard({ contest }: ContestCardProps) {
  const config = STATUS_CONFIG[contest.status]
  const StatusIcon = config.icon

  const daysUntil = Math.ceil((new Date(contest.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.ceil((new Date(contest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Link href={`/contests/${contest.id}`}>
      <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6 hover:border-accent-cyan transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-bold text-lg text-text-primary">
                {contest.name}
              </h3>
              <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", config.bg, config.color)}>
                <StatusIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary line-clamp-2">
              {contest.description}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatItem
            icon={Calendar}
            label={contest.status === "ACTIVE" ? "Se termine dans" : "Commence dans"}
            value={contest.status === "ACTIVE" ? `${daysRemaining}j` : `${daysUntil}j`}
          />
          <StatItem
            icon={Users}
            label="Participants"
            value={contest.maxParticipants
              ? `${contest.participantCount}/${contest.maxParticipants}`
              : contest.participantCount.toString()
            }
          />
          <StatItem
            icon={Coins}
            label="Entrée"
            value={contest.entryFee > 0 ? `${contest.entryFee} pts` : "Gratuit"}
          />
          <StatItem
            icon={Trophy}
            label="Prix"
            value={`${contest.prizePool} pts`}
          />
        </div>
      </div>
    </Link>
  )
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: string
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-text-tertiary flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="text-sm font-semibold text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}
