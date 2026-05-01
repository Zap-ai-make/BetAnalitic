"use client"

/**
 * Epic 10 Story 10.2: Admin Expert Applications Queue
 * Review and manage expert applications
 */

import * as React from "react"
import { Crown, Filter, Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { ExpertApplicationReview } from "~/components/features/expert/ExpertApplicationReview"

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED"

export default function AdminExpertApplicationsPage() {
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("PENDING")
  const [searchQuery, setSearchQuery] = React.useState("")

  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR"

  const { data: applications, refetch } = api.expert.admin.listApplications.useQuery({
    status: filterStatus === "ALL" ? undefined : filterStatus,
  })

  const approveMutation = api.expert.admin.approveApplication.useMutation({
    onSuccess: () => {
      void refetch()
    },
  })

  const rejectMutation = api.expert.admin.rejectApplication.useMutation({
    onSuccess: () => {
      void refetch()
    },
  })

  const handleApprove = async (applicationId: string) => {
    await approveMutation.mutateAsync({ applicationId })
  }

  const handleReject = async (applicationId: string, reason: string) => {
    await rejectMutation.mutateAsync({ applicationId, reason })
  }

  const filteredApplications = applications?.filter((app) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      app.user.username.toLowerCase().includes(query) ||
      (app.user.email?.toLowerCase().includes(query) ?? false) ||
      (app.user.displayName?.toLowerCase().includes(query) ?? false)
    )
  })

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            Accès refusé
          </h1>
          <p className="text-text-secondary">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-accent-gold animate-pulse" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Candidatures Expert
            </h1>
          </div>
          <p className="text-text-secondary">
            Examiner et valider les demandes de programme Expert
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-bg-tertiary">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                filterStatus === "ALL"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                filterStatus === "PENDING"
                  ? "bg-accent-orange text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              En attente
            </button>
            <button
              onClick={() => setFilterStatus("APPROVED")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                filterStatus === "APPROVED"
                  ? "bg-accent-green text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Approuvées
            </button>
            <button
              onClick={() => setFilterStatus("REJECTED")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                filterStatus === "REJECTED"
                  ? "bg-accent-red text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Rejetées
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, username, email..."
              className={cn(
                "w-full pl-11 pr-4 py-2 bg-bg-secondary rounded-xl border border-bg-tertiary",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              )}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
            <p className="text-xs text-text-tertiary mb-1">Total</p>
            <p className="text-2xl font-display font-bold text-text-primary">
              {applications?.length ?? 0}
            </p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-accent-orange/30">
            <p className="text-xs text-text-tertiary mb-1">En attente</p>
            <p className="text-2xl font-display font-bold text-accent-orange">
              {applications?.filter((a) => a.status === "PENDING").length ?? 0}
            </p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-accent-green/30">
            <p className="text-xs text-text-tertiary mb-1">Approuvées</p>
            <p className="text-2xl font-display font-bold text-accent-green">
              {applications?.filter((a) => a.status === "APPROVED").length ?? 0}
            </p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-accent-red/30">
            <p className="text-xs text-text-tertiary mb-1">Rejetées</p>
            <p className="text-2xl font-display font-bold text-accent-red">
              {applications?.filter((a) => a.status === "REJECTED").length ?? 0}
            </p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications && filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <ExpertApplicationReview
                key={application.id}
                application={application}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          ) : (
            <div className="bg-bg-secondary rounded-2xl p-12 border border-bg-tertiary text-center">
              <Filter className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Aucune candidature trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
