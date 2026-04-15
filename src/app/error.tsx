"use client"

/**
 * Global Error Page (App Router)
 */

import { useEffect } from "react"
import { PageError } from "~/components/features/error/ErrorBoundary"
import { trackError } from "~/lib/observability/analytics"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    trackError(error, {
      digest: error.digest,
      page: "global-error",
    })
  }, [error])

  return <PageError reset={reset} />
}
