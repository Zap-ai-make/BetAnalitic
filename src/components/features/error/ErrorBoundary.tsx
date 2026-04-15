"use client"

/**
 * Story 15.2: Error Boundary
 */

import * as React from "react"
import Link from "next/link"
import { cn } from "~/lib/utils"
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react"
import { trackError } from "~/lib/observability/analytics"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo })

    // Track error
    trackError(error, {
      componentStack: errorInfo.componentStack,
      boundary: "ErrorBoundary",
    })

    // Call custom handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  onRetry?: () => void
}

function ErrorFallback({ error, errorInfo, onRetry }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-bg-secondary rounded-2xl p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-state-error/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-state-error" />
          </div>

          {/* Message */}
          <h2 className="text-xl font-display font-bold text-text-primary mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-text-secondary mb-6">
            Nous nous excusons pour ce désagrément. Veuillez réessayer ou retourner à l&apos;accueil.
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center mb-4">
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                "flex items-center gap-2 px-4 py-2",
                "bg-accent-cyan text-bg-primary rounded-xl font-medium",
                "hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-4 py-2",
                "bg-bg-tertiary text-text-primary rounded-xl font-medium",
                "hover:bg-bg-tertiary/80 transition-colors min-h-[44px]"
              )}
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </div>

          {/* Error Details Toggle */}
          {(error ?? errorInfo) && (
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mx-auto"
            >
              Détails techniques
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Error Details */}
          {showDetails && (
            <div className="mt-4 p-4 bg-bg-tertiary rounded-xl text-left overflow-auto max-h-[200px]">
              <p className="text-sm font-mono text-state-error mb-2">
                {error?.message ?? "Unknown error"}
              </p>
              {errorInfo?.componentStack && (
                <pre className="text-xs text-text-tertiary whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Story 15.3: Async Error Boundary (Suspense-like)
 */
interface AsyncBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export function AsyncBoundary({ children, fallback, errorFallback }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <React.Suspense fallback={fallback ?? <LoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full" />
    </div>
  )
}

/**
 * Story 15.4: Page Error Component
 */
interface PageErrorProps {
  reset?: () => void
  className?: string
}

export function PageError({ reset, className }: PageErrorProps) {
  return (
    <div className={cn("min-h-screen bg-bg-primary flex items-center justify-center p-6", className)}>
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl mb-6">💥</div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">
          Oups !
        </h1>
        <p className="text-text-secondary mb-8">
          Cette page a rencontré un problème. Nos équipes sont informées et travaillent à le résoudre.
        </p>
        <div className="flex gap-4 justify-center">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
            >
              Réessayer
            </button>
          )}
          <Link
            href="/"
            className="px-6 py-3 bg-bg-secondary text-text-primary rounded-xl font-medium hover:bg-bg-tertiary transition-colors min-h-[44px]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Story 15.5: 404 Not Found Component
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">
          Page non trouvée
        </h1>
        <p className="text-text-secondary mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
