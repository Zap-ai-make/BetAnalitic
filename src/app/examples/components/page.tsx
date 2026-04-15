import { Button } from "~/components/ui/button";
import { Badge, AgentBadge } from "~/components/ui/badge";

export default function ComponentsExamplesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-bg-primary text-text-primary font-body p-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Component Library Examples
          </h1>
          <p className="font-body text-base text-text-secondary">
            Showcase of all Button and Badge variants with design tokens
          </p>
        </div>

        {/* Button Variants Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-cyan pl-4">
            Button Variants
          </h2>

          {/* Primary Buttons */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Primary - Gradient with Glow
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Button variant="primary" size="sm">
                Small Primary
              </Button>
              <Button variant="primary" size="default">
                Analyser le Match
              </Button>
              <Button variant="primary" size="lg">
                Large Primary
              </Button>
              <Button variant="primary" size="icon" aria-label="Icon button">
                ⚽
              </Button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Secondary - Outlined
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Button variant="secondary" size="sm">
                Small Secondary
              </Button>
              <Button variant="secondary" size="default">
                Voir Plus
              </Button>
              <Button variant="secondary" size="lg">
                Large Secondary
              </Button>
            </div>
          </div>

          {/* Ghost Buttons */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Ghost - Transparent
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Button variant="ghost" size="sm">
                Small Ghost
              </Button>
              <Button variant="ghost" size="default">
                Annuler
              </Button>
              <Button variant="ghost" size="lg">
                Large Ghost
              </Button>
            </div>
          </div>

          {/* AgentInvoke Buttons */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              AgentInvoke - Agent-specific Gradients
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Button variant="agentInvoke" agent="scout">
                @Scout Analyse
              </Button>
              <Button variant="agentInvoke" agent="insider">
                @Insider Info
              </Button>
              <Button variant="agentInvoke" agent="referee">
                @Referee Check
              </Button>
              <Button variant="agentInvoke" agent="tactic">
                @Tactic Review
              </Button>
            </div>
          </div>

          {/* Disabled State */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Disabled State
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Button variant="primary" disabled>
                Disabled Primary
              </Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
              <Button variant="ghost" disabled>
                Disabled Ghost
              </Button>
            </div>
          </div>
        </section>

        {/* Badge Variants Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-orange pl-4">
            Badge Variants
          </h2>

          {/* Premium & Expert Badges */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Premium & Expert
            </h3>
            <div className="flex gap-4 flex-wrap items-center bg-bg-secondary p-6 rounded-lg">
              <Badge variant="premium">PREMIUM</Badge>
              <Badge variant="expert">EXPERT</Badge>
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="destructive">Error Badge</Badge>
            </div>
          </div>

          {/* Agent Badges - All 14 Agents */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium text-text-secondary">
              Agent Badges - 14 Agent Colors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-bg-secondary p-6 rounded-lg">
              <AgentBadge agent="scout">Scout</AgentBadge>
              <AgentBadge agent="insider">Insider</AgentBadge>
              <AgentBadge agent="referee">Referee</AgentBadge>
              <AgentBadge agent="tactic">Tactic</AgentBadge>
              <AgentBadge agent="context">Context</AgentBadge>
              <AgentBadge agent="momentum">Momentum</AgentBadge>
              <AgentBadge agent="wall">Wall</AgentBadge>
              <AgentBadge agent="goal">Goal</AgentBadge>
              <AgentBadge agent="corner">Corner</AgentBadge>
              <AgentBadge agent="card">Card</AgentBadge>
              <AgentBadge agent="crowd">Crowd</AgentBadge>
              <AgentBadge agent="live">Live</AgentBadge>
              <AgentBadge agent="debate">Debate</AgentBadge>
              <AgentBadge agent="debrief">Debrief</AgentBadge>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-green pl-4">
            Real-world Examples
          </h2>

          {/* Card Example 1: Match Analysis */}
          <div className="bg-bg-secondary rounded-lg p-6 border-l-4 border-agent-scout space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-text-primary">
                  PSG vs Marseille
                </h3>
                <p className="font-body text-sm text-text-secondary mt-1">
                  Ligue 1 • Dimanche 20:45
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="premium">PREMIUM</Badge>
                <AgentBadge agent="live">EN DIRECT</AgentBadge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary">Analyser</Button>
              <Button variant="secondary">Voir Stats</Button>
              <Button variant="ghost">Plus tard</Button>
            </div>
          </div>

          {/* Card Example 2: Expert Analysis */}
          <div className="bg-bg-tertiary rounded-lg p-6 border-l-4 border-agent-context space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-text-primary">
                  Analyse Tactique Complète
                </h3>
                <p className="font-body text-sm text-text-secondary mt-1">
                  Par @TacticMaster • 14 agents
                </p>
              </div>
              <Badge variant="expert">EXPERT</Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AgentBadge agent="scout">Scout</AgentBadge>
              <AgentBadge agent="tactic">Tactic</AgentBadge>
              <AgentBadge agent="context">Context</AgentBadge>
              <AgentBadge agent="momentum">Momentum</AgentBadge>
            </div>
            <div className="flex gap-3">
              <Button variant="agentInvoke" agent="tactic">
                @TacticMaster Analyse
              </Button>
              <Button variant="secondary">Partager</Button>
            </div>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="bg-bg-tertiary rounded-lg p-6 space-y-3">
          <h3 className="font-display text-lg font-semibold text-accent-cyan">
            ✓ Accessibility Verified
          </h3>
          <ul className="font-mono text-sm text-text-secondary space-y-2">
            <li>• Minimum 44x44px touch targets (all button sizes)</li>
            <li>• Focus-visible states with cyan ring</li>
            <li>• Keyboard navigation (Tab, Enter, Space)</li>
            <li>• Aria-label support for icon-only buttons</li>
            <li>• High contrast text on all backgrounds</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
