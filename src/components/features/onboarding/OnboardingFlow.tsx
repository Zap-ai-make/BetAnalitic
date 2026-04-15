"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

import { ModeChoiceStep } from "./ModeChoiceStep"
import { FavoriteTeamsStep } from "./FavoriteTeamsStep"
import { AlertsConfigStep } from "./AlertsConfigStep"
import { AgentsIntroStep } from "./AgentsIntroStep"

type UserMode = "ANALYTIC" | "SUPPORTER"

const STEPS = [
  { id: 1, title: "Mode", icon: "🎯" },
  { id: 2, title: "Équipes", icon: "⚽" },
  { id: 3, title: "Alertes", icon: "🔔" },
  { id: 4, title: "Agents", icon: "🤖" },
]

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Mode
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null)

  // Step 2: Teams
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  // Step 3: Alerts
  const [matchAlerts, setMatchAlerts] = useState(true)
  const [agentAlerts, setAgentAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  const utils = api.useUtils()

  const saveModeMutation = api.onboarding.saveMode.useMutation()
  const saveTeamsMutation = api.onboarding.saveTeams.useMutation()
  const saveAlertsMutation = api.onboarding.saveAlerts.useMutation()
  const completeMutation = api.onboarding.complete.useMutation({
    onSuccess: () => {
      void utils.onboarding.getStatus.invalidate()
      router.push("/")
    },
  })
  const skipMutation = api.onboarding.skip.useMutation({
    onSuccess: () => {
      void utils.onboarding.getStatus.invalidate()
      router.push("/")
    },
  })

  const isLoading =
    saveModeMutation.isPending ||
    saveTeamsMutation.isPending ||
    saveAlertsMutation.isPending ||
    completeMutation.isPending ||
    skipMutation.isPending

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedMode !== null
      case 2:
        return true // Optional
      case 3:
        return true // Optional
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    try {
      switch (currentStep) {
        case 1:
          if (selectedMode) {
            await saveModeMutation.mutateAsync({ mode: selectedMode })
          }
          break
        case 2:
          await saveTeamsMutation.mutateAsync({
            teams: selectedTeams,
            sports: selectedSports,
          })
          break
        case 3:
          await saveAlertsMutation.mutateAsync({
            matchAlerts,
            agentAlerts,
            weeklyDigest,
          })
          break
        case 4:
          await completeMutation.mutateAsync()
          return // Don't increment step
      }
      setCurrentStep((s) => Math.min(s + 1, 4))
    } catch (error) {
      console.error("Onboarding step error:", error)
    }
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const handleSkip = () => {
    skipMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-text-primary">
            Configuration
          </h1>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Passer
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                currentStep >= step.id
                  ? "bg-accent-cyan"
                  : "bg-bg-tertiary"
              )}
            />
          ))}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={cn(
                "text-center transition-all",
                currentStep === step.id
                  ? "text-text-primary"
                  : "text-text-tertiary"
              )}
            >
              <span className="text-lg">{step.icon}</span>
              <div className="text-xs mt-0.5">{step.title}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {currentStep === 1 && (
          <ModeChoiceStep
            selectedMode={selectedMode}
            onSelect={setSelectedMode}
          />
        )}
        {currentStep === 2 && (
          <FavoriteTeamsStep
            selectedSports={selectedSports}
            selectedTeams={selectedTeams}
            onSportsChange={setSelectedSports}
            onTeamsChange={setSelectedTeams}
          />
        )}
        {currentStep === 3 && (
          <AlertsConfigStep
            matchAlerts={matchAlerts}
            agentAlerts={agentAlerts}
            weeklyDigest={weeklyDigest}
            onChange={(key, value) => {
              if (key === "matchAlerts") setMatchAlerts(value)
              if (key === "agentAlerts") setAgentAlerts(value)
              if (key === "weeklyDigest") setWeeklyDigest(value)
            }}
          />
        )}
        {currentStep === 4 && <AgentsIntroStep />}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-bg-tertiary space-y-3">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="w-full"
        >
          {isLoading
            ? "..."
            : currentStep === 4
            ? "Commencer"
            : "Continuer"}
        </Button>
        {currentStep > 1 && (
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isLoading}
            className="w-full"
          >
            Retour
          </Button>
        )}
      </footer>
    </div>
  )
}
