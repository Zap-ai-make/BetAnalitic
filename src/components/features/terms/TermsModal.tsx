"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "~/components/ui/button"

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
  isLoading?: boolean
}

export function TermsModal({
  isOpen,
  onAccept,
  onDecline,
  isLoading = false,
}: TermsModalProps) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [riskChecked, setRiskChecked] = useState(false)
  const [ageChecked, setAgeChecked] = useState(false)

  const canAccept = termsChecked && riskChecked && ageChecked

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-bg-tertiary">
          <h2 className="font-display text-xl font-bold text-text-primary text-center">
            Conditions d&apos;utilisation
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Risk Disclaimer */}
          <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-accent-yellow mb-2">
                  Avertissement sur les risques
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  BetAnalytic fournit des analyses à titre informatif uniquement.
                  Ces informations <strong>ne constituent pas des conseils financiers
                  ou de paris</strong>. Les décisions de paris relèvent de votre seule
                  responsabilité. Le jeu comporte des risques de perte financière.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              En utilisant BetAnalytic, vous acceptez :
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span>
                <span>Les analyses sont fournies à titre informatif uniquement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span>
                <span>Aucune garantie de résultat n&apos;est fournie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span>
                <span>Vous êtes seul responsable de vos décisions de paris</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span>
                <span>Les paris peuvent entraîner des pertes financières</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span>
                <span>Le service est réservé aux personnes majeures</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex gap-4 text-sm">
            <Link href="/terms" className="text-accent-cyan hover:underline">
              Conditions complètes →
            </Link>
            <Link href="/privacy" className="text-accent-cyan hover:underline">
              Politique de confidentialité →
            </Link>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-bg-tertiary bg-bg-primary accent-accent-cyan"
              />
              <span className="text-sm text-text-secondary">
                J&apos;ai lu et j&apos;accepte les{" "}
                <Link href="/terms" className="text-accent-cyan hover:underline">
                  conditions d&apos;utilisation
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={riskChecked}
                onChange={(e) => setRiskChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-bg-tertiary bg-bg-primary accent-accent-cyan"
              />
              <span className="text-sm text-text-secondary">
                Je comprends que les analyses sont <strong>informatives uniquement</strong>{" "}
                et ne constituent pas des conseils financiers
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageChecked}
                onChange={(e) => setAgeChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-bg-tertiary bg-bg-primary accent-accent-cyan"
              />
              <span className="text-sm text-text-secondary">
                Je confirme avoir <strong>18 ans ou plus</strong> et être responsable
                de mes décisions
              </span>
            </label>
          </div>

          {/* Help Link */}
          <div className="text-center text-xs text-text-tertiary">
            Besoin d&apos;aide ?{" "}
            <Link href="/help/responsible-gambling" className="text-accent-cyan hover:underline">
              Jeu responsable
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bg-tertiary space-y-3">
          <Button
            onClick={onAccept}
            disabled={!canAccept || isLoading}
            className="w-full"
          >
            {isLoading ? "Acceptation..." : "Accepter et continuer"}
          </Button>
          <Button
            variant="ghost"
            onClick={onDecline}
            disabled={isLoading}
            className="w-full text-text-secondary"
          >
            Refuser (accès limité)
          </Button>
        </div>
      </div>
    </div>
  )
}
