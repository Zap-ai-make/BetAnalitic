"use client"

import { api } from "~/trpc/react"
import { GuidedTour } from "./GuidedTour"

interface TourGateProps {
  children: React.ReactNode
}

/**
 * Wraps the main app and shows the platform tour if needed
 * after tutorial is completed
 */
export function TourGate({ children }: TourGateProps) {
  const { data: status, isLoading } = api.tour.getStatus.useQuery()

  // Don't block while loading
  if (isLoading) {
    return <>{children}</>
  }

  // Show tour if needed
  if (status?.needsTour) {
    return (
      <>
        {children}
        <GuidedTour
          onComplete={() => {
            // Tour completed, children will re-render
          }}
          onSkip={() => {
            // Tour skipped, children will re-render
          }}
        />
      </>
    )
  }

  return <>{children}</>
}
