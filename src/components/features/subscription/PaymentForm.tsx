"use client"

/**
 * Story 9.5: Payment Form
 * Subscription checkout
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { CreditCard, Lock, Check, AlertCircle } from "lucide-react"

interface PaymentFormProps {
  planName: string
  price: number
  period: "month" | "year"
  onSubmit: (paymentMethod: string) => Promise<void>
  onCancel: () => void
  className?: string
}

export function PaymentForm({
  planName,
  price,
  period,
  onSubmit,
  onCancel,
  className,
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [name, setName] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const groups = digits.match(/.{1,4}/g) ?? []
    return groups.join(" ").slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsProcessing(true)

    try {
      // Mock payment processing
      await onSubmit("card")
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={cn("p-6 bg-bg-secondary rounded-2xl", className)}>
      {/* Summary */}
      <div className="p-4 bg-bg-tertiary rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Plan {planName}</p>
            <p className="text-sm text-text-tertiary">
              Facturation {period === "month" ? "mensuelle" : "annuelle"}
            </p>
          </div>
          <p className="text-2xl font-bold font-mono text-text-primary">
            {price.toFixed(2)}€
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Numéro de carte
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={cn(
                "w-full pl-11 pr-4 py-3 bg-bg-tertiary rounded-xl",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              )}
            />
          </div>
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Expiration
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              maxLength={5}
              className={cn(
                "w-full px-4 py-3 bg-bg-tertiary rounded-xl",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              maxLength={4}
              className={cn(
                "w-full px-4 py-3 bg-bg-tertiary rounded-xl",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              )}
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Nom sur la carte
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            className={cn(
              "w-full px-4 py-3 bg-bg-tertiary rounded-xl",
              "text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
            )}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent-red" />
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Lock className="w-4 h-4" />
          <span>Paiement sécurisé par Stripe. Nous ne stockons pas vos données de carte.</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-bg-tertiary text-text-primary font-medium hover:bg-bg-tertiary/80 transition-colors min-h-[44px]"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isProcessing || !cardNumber || !expiry || !cvc || !name}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl font-medium min-h-[44px]",
              "transition-colors",
              isProcessing || !cardNumber || !expiry || !cvc || !name
                ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                : "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
            )}
          >
            {isProcessing ? "Traitement..." : `Payer ${price.toFixed(2)}€`}
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * Story 9.6: Payment Success
 */
interface PaymentSuccessProps {
  planName: string
  onContinue: () => void
  className?: string
}

export function PaymentSuccess({
  planName,
  onContinue,
  className,
}: PaymentSuccessProps) {
  return (
    <div className={cn("p-8 bg-bg-secondary rounded-2xl text-center", className)}>
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-green/20 flex items-center justify-center">
        <Check className="w-8 h-8 text-accent-green" />
      </div>

      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
        Bienvenue dans {planName} ! 🎉
      </h2>

      <p className="text-text-secondary mb-6">
        Votre abonnement est maintenant actif. Profitez de toutes les fonctionnalités !
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
      >
        Commencer
      </button>
    </div>
  )
}
