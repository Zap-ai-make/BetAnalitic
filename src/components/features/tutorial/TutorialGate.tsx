"use client"

import { api } from "~/trpc/react"
import { FirstAnalysisTutorial } from "./FirstAnalysisTutorial"

interface TutorialGateProps {
  children: React.ReactNode
}

/**
 * Wraps the main app and shows the tutorial if needed
 * after onboarding is completed
 */
export function TutorialGate({ children }: TutorialGateProps) {
  const { data: status, isLoading } = api.tutorial.getStatus.useQuery()

  // Don't block while loading
  if (isLoading) {
    return <>{children}</>
  }

  // Show tutorial if needed
  if (status?.needsTutorial) {
    return (
      <>
        {children}
        <FirstAnalysisTutorial
          onComplete={() => {
            // Tutorial completed, children will re-render
          }}
          onSkip={() => {
            // Tutorial skipped, children will re-render
          }}
        />
      </>
    )
  }

  return <>{children}</>
}
