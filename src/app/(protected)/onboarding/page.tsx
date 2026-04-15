"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { OnboardingFlow } from "~/components/features/onboarding"
import { api } from "~/trpc/react"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const restart = searchParams.get("restart") === "true"
  const [showFlow, setShowFlow] = useState(false)

  const utils = api.useUtils()
  const { data: status, isLoading } = api.onboarding.getStatus.useQuery()

  const restartMutation = api.onboarding.restart.useMutation({
    onSuccess: () => {
      void utils.onboarding.getStatus.invalidate()
      setShowFlow(true)
    },
  })

  useEffect(() => {
    // Auto-restart if user manually navigated here and has completed onboarding
    if (status && !status.needsOnboarding && !restartMutation.isPending && !showFlow) {
      restartMutation.mutate()
    }
  }, [status, restartMutation, showFlow])

  useEffect(() => {
    // If restart param is set and onboarding is already done, restart it
    if (restart && status && !status.needsOnboarding && !restartMutation.isPending && !showFlow) {
      restartMutation.mutate()
    }
  }, [restart, status, restartMutation, showFlow])

  if (isLoading || restartMutation.isPending) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  // Show onboarding if needed or after restart
  if (status?.needsOnboarding ?? showFlow) {
    return <OnboardingFlow />
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Préparation...</div>
    </div>
  )
}
