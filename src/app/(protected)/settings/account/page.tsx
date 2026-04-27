"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"
import { formatDate } from "~/lib/formatDate"

type ModalType = "export" | "delete" | "cancel-delete" | null

export default function AccountSettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [exportData, setExportData] = useState<object | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const utils = api.useUtils()

  const { data: accountStatus, isLoading } = api.account.getAccountStatus.useQuery()

  const verifyPasswordMutation = api.account.verifyPassword.useMutation({
    onError: (err) => {
      setPasswordError(err.message)
    },
  })

  const requestExportMutation = api.account.requestExport.useMutation({
    onSuccess: (data) => {
      setExportData(data.data)
      setActiveModal(null)
      setPassword("")
      void utils.account.getAccountStatus.invalidate()
    },
    onError: (err) => {
      setPasswordError(err.message)
    },
  })

  const scheduleDeleteMutation = api.account.scheduleAccountDeletion.useMutation({
    onSuccess: () => {
      setActiveModal(null)
      setPassword("")
      setDeleteReason("")
      setSuccessMessage("Suppression programmée. Vous avez 30 jours pour annuler.")
      setTimeout(() => setSuccessMessage(null), 5000)
      void utils.account.getAccountStatus.invalidate()
    },
    onError: (err) => {
      setPasswordError(err.message)
    },
  })

  const cancelDeleteMutation = api.account.cancelAccountDeletion.useMutation({
    onSuccess: () => {
      setActiveModal(null)
      setSuccessMessage("Suppression annulée.")
      setTimeout(() => setSuccessMessage(null), 3000)
      void utils.account.getAccountStatus.invalidate()
    },
  })

  const handleExport = async () => {
    setPasswordError(null)
    try {
      await verifyPasswordMutation.mutateAsync({ password })
      await requestExportMutation.mutateAsync()
    } catch {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    setPasswordError(null)
    try {
      await verifyPasswordMutation.mutateAsync({ password })
      await scheduleDeleteMutation.mutateAsync({ reason: deleteReason || undefined })
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancelDelete = () => {
    cancelDeleteMutation.mutate()
  }

  const downloadExport = () => {
    if (!exportData) return
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `betanalytic-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setExportData(null)
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
          <h1 className="font-display font-bold text-text-primary">Mon compte</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
          <p className="text-sm text-accent-green text-center">{successMessage}</p>
        </div>
      )}

      <main className="p-4 space-y-6 pb-8">
        {/* Account Info */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <h2 className="font-display font-semibold text-text-primary mb-2">
            Informations du compte
          </h2>
          <p className="text-sm text-text-secondary">
            Compte créé le {formatDate(accountStatus?.accountCreatedAt, { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Deletion Warning */}
        {accountStatus?.deletionScheduledAt && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4">
            <h2 className="font-display font-semibold text-accent-red mb-2">
              Suppression programmée
            </h2>
            <p className="text-sm text-text-secondary mb-3">
              Votre compte sera supprimé le{" "}
              <strong>{formatDate(accountStatus.deletionWillCompleteAt, { day: "numeric", month: "long", year: "numeric" })}</strong>.
              Toutes vos données seront définitivement effacées.
            </p>
            <Button
              onClick={() => setActiveModal("cancel-delete")}
              className="w-full"
            >
              Annuler la suppression
            </Button>
          </div>
        )}

        {/* Data Export */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <h2 className="font-display font-semibold text-text-primary mb-2">
            Exporter mes données
          </h2>
          <p className="text-sm text-text-secondary mb-3">
            Téléchargez une copie de toutes vos données personnelles au format JSON.
            {!accountStatus?.canExport && accountStatus?.exportCooldownEndsAt && (
              <span className="block mt-1 text-accent-yellow">
                Prochaine exportation possible le{" "}
                {formatDate(accountStatus.exportCooldownEndsAt, { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => setActiveModal("export")}
            disabled={!accountStatus?.canExport}
            className="w-full"
          >
            Exporter mes données
          </Button>
        </div>

        {/* Account Deletion */}
        {!accountStatus?.deletionScheduledAt && (
          <div className="bg-bg-secondary rounded-xl p-4">
            <h2 className="font-display font-semibold text-text-primary mb-2">
              Supprimer mon compte
            </h2>
            <p className="text-sm text-text-secondary mb-3">
              Cette action programmera la suppression de votre compte dans 30 jours.
              Vous pourrez annuler pendant cette période.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveModal("delete")}
              className="w-full text-accent-red border-accent-red/30 hover:bg-accent-red/10"
            >
              Supprimer mon compte
            </Button>
          </div>
        )}

        {/* RGPD Info */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <h2 className="font-display font-semibold text-text-primary mb-2">
            Vos droits RGPD
          </h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent-cyan">•</span>
              <span>Droit d&apos;accès à vos données personnelles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-cyan">•</span>
              <span>Droit de rectification de vos informations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-cyan">•</span>
              <span>Droit à l&apos;effacement (droit à l&apos;oubli)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-cyan">•</span>
              <span>Droit à la portabilité des données</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Export Modal */}
      {activeModal === "export" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display font-bold text-text-primary text-lg">
              Confirmer l&apos;export
            </h2>
            <p className="text-sm text-text-secondary">
              Entrez votre mot de passe pour confirmer l&apos;export de vos données.
            </p>
            <Input
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError ?? undefined}
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveModal(null)
                  setPassword("")
                  setPasswordError(null)
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleExport}
                disabled={!password || verifyPasswordMutation.isPending}
                className="flex-1"
              >
                {verifyPasswordMutation.isPending ? "..." : "Exporter"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display font-bold text-accent-red text-lg">
              Supprimer le compte
            </h2>
            <div className="space-y-2 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">Cette action va :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Programmer la suppression dans 30 jours</li>
                <li>Effacer toutes vos données personnelles</li>
                <li>Supprimer votre historique d&apos;analyses</li>
                <li>Annuler votre abonnement</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Raison (optionnel)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
                className={cn(
                  "w-full h-20 rounded-lg border-2 bg-bg-primary px-4 py-3",
                  "text-sm text-text-primary placeholder:text-text-tertiary",
                  "resize-none focus:outline-none focus:border-accent-cyan",
                  "border-transparent hover:border-bg-tertiary"
                )}
              />
            </div>
            <Input
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError ?? undefined}
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveModal(null)
                  setPassword("")
                  setDeleteReason("")
                  setPasswordError(null)
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!password || scheduleDeleteMutation.isPending}
                className="flex-1 bg-accent-red hover:bg-accent-red/80"
              >
                {scheduleDeleteMutation.isPending ? "..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Delete Modal */}
      {activeModal === "cancel-delete" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display font-bold text-text-primary text-lg">
              Annuler la suppression ?
            </h2>
            <p className="text-sm text-text-secondary">
              Votre compte sera conservé et vous pourrez continuer à l&apos;utiliser normalement.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveModal(null)}
                className="flex-1"
              >
                Non, garder
              </Button>
              <Button
                onClick={handleCancelDelete}
                disabled={cancelDeleteMutation.isPending}
                className="flex-1"
              >
                {cancelDeleteMutation.isPending ? "..." : "Oui, annuler"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Download Modal */}
      {exportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="w-16 h-16 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="font-display font-bold text-text-primary text-lg text-center">
              Export prêt !
            </h2>
            <p className="text-sm text-text-secondary text-center">
              Vos données sont prêtes à être téléchargées.
            </p>
            <Button onClick={downloadExport} className="w-full">
              Télécharger le fichier JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => setExportData(null)}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
