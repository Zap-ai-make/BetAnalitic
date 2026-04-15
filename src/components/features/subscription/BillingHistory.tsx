"use client"

/**
 * Story 9.7: Billing History
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Download, Check, X, Clock, CreditCard } from "lucide-react"

interface Invoice {
  id: string
  date: Date
  amount: number
  status: "paid" | "pending" | "failed"
  description: string
  downloadUrl?: string
}

interface BillingHistoryProps {
  invoices: Invoice[]
  onDownload?: (invoiceId: string) => void
  className?: string
}

export function BillingHistory({
  invoices,
  onDownload,
  className,
}: BillingHistoryProps) {
  const statusConfig = {
    paid: {
      icon: Check,
      color: "text-accent-green bg-accent-green/20",
      label: "Payé",
    },
    pending: {
      icon: Clock,
      color: "text-accent-orange bg-accent-orange/20",
      label: "En attente",
    },
    failed: {
      icon: X,
      color: "text-accent-red bg-accent-red/20",
      label: "Échoué",
    },
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-display font-semibold text-text-primary">
        Historique de facturation
      </h3>

      {invoices.length === 0 ? (
        <div className="p-8 bg-bg-secondary rounded-xl text-center">
          <CreditCard className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">Aucune facture</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => {
            const status = statusConfig[invoice.status]
            const StatusIcon = status.icon

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", status.color)}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {invoice.description}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {invoice.date.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-medium text-text-primary">
                    {invoice.amount.toFixed(2)}€
                  </span>

                  {invoice.downloadUrl && onDownload && (
                    <button
                      type="button"
                      onClick={() => onDownload(invoice.id)}
                      className="p-2 text-text-tertiary hover:text-accent-cyan rounded-lg hover:bg-bg-tertiary transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Story 9.8: Payment Method Card
 */
interface PaymentMethodProps {
  type: "visa" | "mastercard" | "amex"
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault?: boolean
  onSetDefault?: () => void
  onRemove?: () => void
  className?: string
}

export function PaymentMethodCard({
  type,
  last4,
  expiryMonth,
  expiryYear,
  isDefault = false,
  onSetDefault,
  onRemove,
  className,
}: PaymentMethodProps) {
  const brandConfig = {
    visa: { name: "Visa", color: "text-blue-500" },
    mastercard: { name: "Mastercard", color: "text-orange-500" },
    amex: { name: "American Express", color: "text-blue-600" },
  }

  const brand = brandConfig[type]
  const isExpiringSoon =
    new Date(expiryYear, expiryMonth - 1) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  return (
    <div
      className={cn(
        "p-4 bg-bg-secondary rounded-xl border-2",
        isDefault ? "border-accent-cyan" : "border-bg-tertiary",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("font-bold", brand.color)}>{brand.name}</div>
          <span className="font-mono text-text-primary">•••• {last4}</span>
          {isDefault && (
            <span className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs rounded-full">
              Par défaut
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("text-sm", isExpiringSoon ? "text-accent-orange" : "text-text-tertiary")}>
            {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
          </span>
        </div>
      </div>

      {(onSetDefault !== undefined || onRemove !== undefined) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-bg-tertiary">
          {!isDefault && onSetDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              className="text-sm text-accent-cyan hover:underline"
            >
              Définir par défaut
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-accent-red hover:underline ml-auto"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
