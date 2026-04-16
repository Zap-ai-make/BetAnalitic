"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Lock, Sparkles } from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"

export default function AgentPreviewPage() {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = React.useState<string>()
  const [query, setQuery] = React.useState("")
  const [response, setResponse] = React.useState<string>()

  const { data: agents = [] } = api.agents.getAll.useQuery()

  const previewMutation = api.agents.previewAgent.useMutation({
    onSuccess: (data) => {
      setResponse(data.content)
    },
  })

  const handlePreview = () => {
    if (!selectedAgent || !query.trim()) return

    previewMutation.mutate({
      agentType: selectedAgent as "SCOUT" | "FORM" | "H2H" | "STATS" | "MOMENTUM" | "CONTEXT" | "ODDS" | "WEATHER" | "REFEREE" | "INJURY" | "SENTIMENT" | "PREDICTION" | "RISK" | "VALUE",
      query: query.trim(),
    })
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-bg-tertiary p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
            Essayez nos Agents IA
          </h1>
          <p className="text-text-secondary text-sm">
            Découvrez la puissance de nos 14 agents spécialisés en analyse sportive
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Choisissez un agent
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agents.slice(0, 6).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id.toUpperCase())}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    selectedAgent === agent.id.toUpperCase()
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-bg-tertiary bg-bg-secondary hover:border-bg-tertiary/50"
                  )}
                >
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-text-primary text-sm">
                      {agent.name}
                    </div>
                    <div className="text-xs text-text-tertiary truncate">
                      {agent.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Posez votre question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Quelle est la forme de PSG récemment ?"
              className={cn(
                "w-full bg-bg-secondary rounded-lg px-4 py-3",
                "text-text-primary placeholder:text-text-tertiary",
                "border border-bg-tertiary focus:border-accent-cyan focus:outline-none",
                "resize-none"
              )}
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-tertiary">
                {query.length}/500 caractères
              </span>
              <Button
                onClick={handlePreview}
                disabled={!selectedAgent || !query.trim() || previewMutation.isPending}
                className="gap-2"
              >
                {previewMutation.isPending ? (
                  <>Chargement...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Essayer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-accent-cyan">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {agents.find((a) => a.id.toUpperCase() === selectedAgent)?.emoji}
                </span>
                <span className="font-display font-semibold text-text-primary">
                  {agents.find((a) => a.id.toUpperCase() === selectedAgent)?.name}
                </span>
              </div>
              <p className="text-text-primary whitespace-pre-wrap">{response}</p>

              {/* Preview limitations notice */}
              <div className="mt-4 pt-4 border-t border-bg-tertiary">
                <div className="flex items-start gap-3 p-3 bg-accent-cyan/10 rounded-lg">
                  <Lock className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary mb-1">
                      Aperçu limité
                    </p>
                    <p className="text-xs text-text-secondary">
                      Créez un compte gratuit pour accéder aux analyses complètes,
                      aux sources détaillées, et aux 14 agents spécialisés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {previewMutation.error && (
            <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
              <p className="text-sm text-accent-red">
                {previewMutation.error.message}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-xl p-6 text-center border border-accent-cyan/30">
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">
              Prêt à aller plus loin ?
            </h3>
            <p className="text-text-secondary mb-4 text-sm">
              Débloquez l&apos;accès complet aux 14 agents IA, analyses illimitées,
              et fonctionnalités premium
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push("/register")}
                className="gap-2"
              >
                Créer un compte gratuit
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
