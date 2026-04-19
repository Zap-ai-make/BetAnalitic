"use client"

/**
 * Epic 11 Story 11.2: Referral Tracking & Rewards
 * Landing page for referral links
 */

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Gift, UserPlus, TrendingUp, Award } from "lucide-react"
import { api } from "~/trpc/react"

export default function ReferralLandingPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  // Track the click
  const trackClickMutation = api.referral.trackReferralClick.useMutation()

  React.useEffect(() => {
    if (code) {
      // Store referral code in localStorage for signup
      localStorage.setItem("referralCode", code)

      // Track the click
      trackClickMutation.mutate({ referralCode: code })
    }
  }, [code, trackClickMutation])

  const handleSignup = () => {
    router.push("/auth/signup")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-accent-cyan/5 to-accent-purple/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Hero Card */}
        <div className="bg-bg-secondary rounded-3xl border border-bg-tertiary shadow-2xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
            Bienvenue sur BetAnalytic !
          </h1>

          <p className="text-lg text-text-secondary mb-8">
            Un ami vous invite à rejoindre la plateforme d&apos;analyse sportive et de pronostics
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <BenefitCard
              icon={Gift}
              title="50 Crédits"
              description="Offerts à l'inscription"
              color="text-accent-gold"
              bg="bg-accent-gold/20"
            />
            <BenefitCard
              icon={TrendingUp}
              title="Analyses IA"
              description="Pronostics experts"
              color="text-accent-cyan"
              bg="bg-accent-cyan/20"
            />
            <BenefitCard
              icon={Award}
              title="Communauté"
              description="Experts & passionnés"
              color="text-accent-purple"
              bg="bg-accent-purple/20"
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleSignup}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl font-display font-bold text-lg hover:shadow-lg hover:scale-105 transition-all min-h-[56px]"
          >
            <UserPlus className="w-6 h-6" />
            S&apos;inscrire et recevoir 50 crédits
          </button>

          <p className="text-xs text-text-tertiary mt-4">
            Code de parrainage : <span className="font-mono font-bold text-accent-cyan">{code}</span>
          </p>
        </div>

        {/* How it works */}
        <div className="mt-8 bg-bg-secondary/50 rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-text-primary mb-4 text-center">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Step number="1" text="Créez votre compte" />
            <Step number="2" text="Recevez 50 crédits gratuits" />
            <Step number="3" text="Commencez à analyser" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface BenefitCardProps {
  icon: React.ElementType
  title: string
  description: string
  color: string
  bg: string
}

function BenefitCard({ icon: Icon, title, description, color, bg }: BenefitCardProps) {
  return (
    <div className="bg-bg-tertiary rounded-2xl p-4">
      <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className={`font-display font-bold ${color} mb-1`}>{title}</p>
      <p className="text-sm text-text-tertiary">{description}</p>
    </div>
  )
}

interface StepProps {
  number: string
  text: string
}

function Step({ number, text }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold flex-shrink-0">
        {number}
      </div>
      <p className="text-sm text-text-secondary text-left">{text}</p>
    </div>
  )
}
