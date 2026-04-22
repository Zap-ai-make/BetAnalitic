"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { OnboardingFlow } from "~/components/features/onboarding"
import { api } from "~/trpc/react"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
    if (isLoading || restartMutation.isPending || showFlow) return

    if (status?.needsOnboarding) {
      // Needs onboarding normally
      setShowFlow(true)
    } else if (restart && status && !status.needsOnboarding) {
      // Explicit restart request
      restartMutation.mutate()
    } else if (status && !status.needsOnboarding && !restart) {
      // Already completed, no restart requested → redirect to dashboard
      router.replace("/dashboard")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isLoading, restart])

  if (isLoading || restartMutation.isPending) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  if (showFlow) {
    return <OnboardingFlow />
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Préparation...</div>
    </div>
  )
}
