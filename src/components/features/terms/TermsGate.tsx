"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { TermsModal } from "./TermsModal"
import { api } from "~/trpc/react"

interface TermsGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * TermsGate wrapper component
 * Shows terms modal if user hasn't accepted terms
 * Use this to wrap agent/analysis features
 */
export function TermsGate({ children, fallback }: TermsGateProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const { data: termsStatus, isLoading } = api.terms.getTermsStatus.useQuery()
  const utils = api.useUtils()

  const acceptTermsMutation = api.terms.acceptTerms.useMutation({
    onSuccess: () => {
      setShowModal(false)
      void utils.terms.getTermsStatus.invalidate()
    },
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  // User can use agents
  if (termsStatus?.canUseAgents) {
    return <>{children}</>
  }

  // Show fallback or trigger modal
  if (!showModal) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-16 h-16 bg-accent-yellow/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="font-display text-xl font-bold text-text-primary text-center">
              Acceptation requise
            </h2>
            <p className="text-text-secondary text-center max-w-sm">
              Pour accéder aux analyses et agents IA, vous devez accepter nos
              conditions d&apos;utilisation et l&apos;avertissement sur les risques.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-accent-cyan text-white font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors"
            >
              Voir les conditions
            </button>
          </div>
        )}
        <TermsModal
          isOpen={showModal}
          onAccept={() => acceptTermsMutation.mutate()}
          onDecline={() => {
            setShowModal(false)
            router.push("/dashboard")
          }}
          isLoading={acceptTermsMutation.isPending}
        />
      </>
    )
  }

  return (
    <TermsModal
      isOpen={showModal}
      onAccept={() => acceptTermsMutation.mutate()}
      onDecline={() => {
        setShowModal(false)
        router.push("/dashboard")
      }}
      isLoading={acceptTermsMutation.isPending}
    />
  )
}
