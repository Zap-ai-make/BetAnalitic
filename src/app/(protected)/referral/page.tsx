"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Copy, Check } from "lucide-react"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"

// Mock data
const MOCK_DATA = {
  commission: 47.97,
  renewals: 24,
  totalReferrals: 45,
  activeReferrals: 24,
  commissionRate: 10,
  referralLink: "betanalytic.io/ref/swabo123",
  notifications: [
    { id: "1", username: "john_doe", action: "s'est réabonné!", amount: 1.99, time: "Il y a 2h" },
    { id: "2", username: "marie92", action: "s'est réabonnée!", amount: 1.99, time: "Hier" },
  ],
  paymentHistory: [
    { id: "1", month: "Avril 2026", renewals: 24, amount: 47.97 },
    { id: "2", month: "Mars 2026", renewals: 20, amount: 39.98 },
    { id: "3", month: "Février 2026", renewals: 18, amount: 35.82 },
  ],
}

export default function ReferralPage() {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MOCK_DATA.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <span className="font-medium">Parrainage</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Commission Card */}
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1))",
          }}
        >
          <p className="text-xs text-text-secondary mb-1">💰 Commission ce mois</p>
          <p className="font-mono text-4xl font-bold text-accent-green mb-1">
            {MOCK_DATA.commission.toFixed(2)} €
          </p>
          <p className="text-xs text-text-tertiary">
            {MOCK_DATA.renewals} renouvellements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-xl font-bold text-text-primary">
              {MOCK_DATA.totalReferrals}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Filleuls</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-xl font-bold text-text-primary">
              {MOCK_DATA.activeReferrals}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Actifs</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <p className="font-mono text-xl font-bold text-text-primary">
              {MOCK_DATA.commissionRate}%
            </p>
            <p className="text-xs text-text-tertiary mt-1">/renouv.</p>
          </div>
        </div>

        {/* Unique Link Section */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>🔗</span>
            Votre lien unique
          </h2>
          <div className="flex items-center gap-2 bg-bg-secondary rounded-xl p-3">
            <input
              type="text"
              value={MOCK_DATA.referralLink}
              readOnly
              className="flex-1 bg-transparent font-mono text-xs text-text-primary outline-none"
            />
            <button
              onClick={handleCopy}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                copied
                  ? "bg-accent-green text-bg-primary"
                  : "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copier
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>🔔</span>
            Notifications récentes
          </h2>
          <div className="space-y-2">
            {MOCK_DATA.notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border-l-4 border-accent-green"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                    <span className="text-accent-green">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      @{notif.username} {notif.action}
                    </p>
                    <p className="text-xs text-accent-green">+{notif.amount.toFixed(2)}€</p>
                  </div>
                </div>
                <span className="text-xs text-text-tertiary">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>📊</span>
            Historique paiements
          </h2>
          <div className="space-y-2">
            {MOCK_DATA.paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{payment.month}</p>
                  <p className="text-xs text-text-tertiary">
                    {payment.renewals} renouvellements
                  </p>
                </div>
                <span className="font-mono text-accent-green font-semibold">
                  {payment.amount.toFixed(2)}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <DashboardNav />
    </div>
  )
}
