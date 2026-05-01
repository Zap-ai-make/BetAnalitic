"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Copy, Check, Share2, Users, TrendingUp, Gift, Loader2 } from "lucide-react"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { api } from "~/trpc/react"

export default function ReferralPage() {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)

  const { data: referralCode, isLoading: codeLoading } = api.referral.getMyReferralCode.useQuery()
  const { data: stats, isLoading: statsLoading } = api.referral.getReferralStats.useQuery()

  const incrementShare = api.referral.incrementShareCount.useMutation()

  const shareLink = referralCode?.shareableLink ?? ""

  const handleCopy = async () => {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    incrementShare.mutate()
  }

  const handleShare = async () => {
    if (!shareLink) return
    if (navigator.share) {
      await navigator.share({
        title: "Rejoins BetAnalytic",
        text: "Inscris-toi et reçois 50 crédits offerts !",
        url: shareLink,
      })
      incrementShare.mutate()
    } else {
      await handleCopy()
    }
  }

  const isLoading = codeLoading || statsLoading

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
            <span className="font-medium">Parrainage</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-28 space-y-6">

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Hero stats ─────────────────────────────────────────────── */}
            <div className="rounded-2xl p-6 text-center bg-linear-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/20">
              <p className="text-xs text-text-tertiary mb-1">Programme ambassadeur</p>
              <p className="font-mono text-4xl font-bold text-accent-cyan mb-1">
                {stats?.totalReferrals ?? 0}
              </p>
              <p className="text-sm text-text-secondary">
                {stats?.totalReferrals === 1 ? "filleul parrainé" : "filleuls parrainés"}
              </p>
            </div>

            {/* ── Stats grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-secondary rounded-2xl p-4 text-center border border-bg-tertiary">
                <p className="font-mono text-xl font-bold text-text-primary">
                  {stats?.activeReferrals ?? 0}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Abonnés actifs</p>
              </div>
              <div className="bg-bg-secondary rounded-2xl p-4 text-center border border-bg-tertiary">
                <p className="font-mono text-xl font-bold text-text-primary">
                  {stats?.clickCount ?? 0}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Clics</p>
              </div>
            </div>

            {/* ── Comment ça marche ──────────────────────────────────────── */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-3">
              <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                Comment ça marche
              </h2>
              <div className="space-y-2.5">
                {[
                  { icon: Share2, text: "Partagez votre lien unique à vos amis", color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
                  { icon: Users, text: "Votre filleul s'inscrit et souscrit à Premium", color: "text-green-400", bg: "bg-green-400/10" },
                  { icon: TrendingUp, text: "Vous recevez 20% sur chaque abonnement de votre filleul", color: "text-amber-400", bg: "bg-amber-400/10" },
                ].map(({ icon: Icon, text, color, bg }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <p className="text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Lien de parrainage ─────────────────────────────────────── */}
            <div className="space-y-3">
              <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <span className="text-base">🔗</span>
                Votre lien unique
              </h2>

              {referralCode ? (
                <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-3 space-y-3">
                  {/* Code badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">Code</span>
                    <span className="font-mono font-bold text-accent-cyan text-sm bg-accent-cyan/10 px-2 py-0.5 rounded-lg">
                      {referralCode.code}
                    </span>
                  </div>

                  {/* Link input */}
                  <div className="flex items-center gap-2 bg-bg-primary rounded-xl p-3">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-transparent font-mono text-xs text-text-secondary outline-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                        copied
                          ? "bg-green-400/10 text-green-400 border border-green-400/20"
                          : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan/10 hover:text-accent-cyan"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copié !" : "Copier"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6 text-center">
                  <p className="text-text-tertiary text-sm">Génération du lien...</p>
                </div>
              )}
            </div>

            {/* ── Liste des filleuls ─────────────────────────────────────── */}
            {(stats?.referrals?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h2 className="font-display font-semibold text-text-primary">Mes filleuls</h2>
                <div className="space-y-2">
                  {stats!.referrals.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl border border-bg-tertiary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                          <span className="font-bold text-accent-cyan text-sm">
                            {(r.displayName ?? r.username ?? "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {r.displayName ?? r.username}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {r.convertedAt
                              ? new Date(r.convertedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.rewardGiven && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                            20%
                          </span>
                        )}
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                          r.status === "ACTIVE"
                            ? "text-green-400 bg-green-400/10 border-green-400/20"
                            : "text-text-tertiary bg-bg-tertiary border-bg-tertiary"
                        )}>
                          {r.status === "ACTIVE" ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(stats?.referrals?.length ?? 0) === 0 && !statsLoading && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🤝</div>
                <p className="text-sm font-semibold text-text-primary">Aucun filleul pour l'instant</p>
                <p className="text-xs text-text-tertiary mt-1">Partagez votre lien pour commencer à gagner des crédits</p>
              </div>
            )}
          </>
        )}
      </main>

      <DashboardNav />
    </div>
  )
}
