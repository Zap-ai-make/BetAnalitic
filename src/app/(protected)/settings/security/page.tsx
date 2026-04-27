"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"
import { formatDate } from "~/lib/formatDate"

export default function SecuritySettingsPage() {
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const utils = api.useUtils()

  const {
    data: sessions,
    isLoading,
  } = api.session.getActiveSessions.useQuery()

  const revokeSessionMutation = api.session.revokeSession.useMutation({
    onSuccess: () => {
      setSuccessMessage("Session révoquée avec succès")
      setTimeout(() => setSuccessMessage(null), 3000)
      void utils.session.getActiveSessions.invalidate()
    },
    onError: (err) => {
      setRevokeError(err.message)
      setTimeout(() => setRevokeError(null), 3000)
    },
  })

  const revokeAllMutation = api.session.revokeAllOtherSessions.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(`${data.revokedCount} session(s) révoquée(s)`)
      setTimeout(() => setSuccessMessage(null), 3000)
      void utils.session.getActiveSessions.invalidate()
    },
    onError: (err) => {
      setRevokeError(err.message)
      setTimeout(() => setRevokeError(null), 3000)
    },
  })

  const handleRevokeSession = (sessionId: string) => {
    setRevokeError(null)
    revokeSessionMutation.mutate({ sessionId })
  }

  const handleRevokeAll = () => {
    setRevokeError(null)
    revokeAllMutation.mutate()
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Mobile":
        return "📱"
      case "Tablet":
        return "📱"
      default:
        return "💻"
    }
  }


  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/profile" className="text-text-secondary hover:text-text-primary">
            ← Retour
          </Link>
          <h1 className="font-display font-bold text-text-primary">Sécurité</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
          <p className="text-sm text-accent-green text-center">{successMessage}</p>
        </div>
      )}
      {revokeError && (
        <div className="mx-4 mt-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
          <p className="text-sm text-accent-red text-center">{revokeError}</p>
        </div>
      )}

      <main className="p-4 space-y-6 pb-8">
        {/* Session Info */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-text-primary">
              Sessions actives
            </h2>
            <span className="text-sm text-text-tertiary">
              {sessions?.length ?? 0}/3 appareils
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            Gérez les appareils connectés à votre compte. Vous pouvez révoquer
            l&apos;accès des appareils que vous ne reconnaissez pas.
          </p>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions?.map((session) => (
            <div
              key={session.id}
              className={cn(
                "bg-bg-secondary rounded-xl p-4",
                session.isCurrent && "border-2 border-accent-cyan"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {getDeviceIcon(session.deviceInfo.device)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {session.deviceInfo.browser} sur {session.deviceInfo.os}
                    </span>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs font-medium rounded">
                        Cet appareil
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {session.ipAddress && (
                      <span className="mr-3">IP: {session.ipAddress}</span>
                    )}
                    <span>Dernière activité: {getRelativeTime(session.lastActiveAt)}</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Connecté le {formatDate(session.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revokeSessionMutation.isPending}
                    className="text-accent-red border-accent-red/30 hover:bg-accent-red/10"
                  >
                    Révoquer
                  </Button>
                )}
              </div>
            </div>
          ))}

          {sessions?.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              Aucune session active trouvée
            </div>
          )}
        </div>

        {/* Revoke All Button */}
        {sessions && sessions.filter((s) => !s.isCurrent).length > 0 && (
          <Button
            variant="outline"
            onClick={handleRevokeAll}
            disabled={revokeAllMutation.isPending}
            className="w-full text-accent-red border-accent-red/30 hover:bg-accent-red/10"
          >
            {revokeAllMutation.isPending
              ? "Révocation..."
              : "Révoquer toutes les autres sessions"}
          </Button>
        )}

        {/* Security Tips */}
        <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-text-primary">
            Conseils de sécurité
          </h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent-green">✓</span>
              <span>Utilisez un mot de passe unique et complexe</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">✓</span>
              <span>Déconnectez-vous des appareils publics ou partagés</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">✓</span>
              <span>Vérifiez régulièrement vos sessions actives</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-yellow">⚠</span>
              <span>Ne partagez jamais vos identifiants</span>
            </li>
          </ul>
        </div>

        {/* Change Password Link */}
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Changer le mot de passe
          </Button>
        </Link>
      </main>
    </div>
  )
}
