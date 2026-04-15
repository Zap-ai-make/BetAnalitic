import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        premium:
          "border-transparent bg-[var(--gradient-premium)] text-white font-bold shadow-lg",
        expert:
          "border-transparent bg-agent-context text-white font-semibold shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Agent Badge Component
type AgentType = "scout" | "insider" | "referee" | "tactic" | "context" | "momentum" | "wall" | "goal" | "corner" | "card" | "crowd" | "live" | "debate" | "debrief"

export interface AgentBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentType
}

const agentColorMap: Record<AgentType, string> = {
  scout: "bg-agent-scout",
  insider: "bg-agent-insider",
  referee: "bg-agent-referee",
  tactic: "bg-agent-tactic",
  context: "bg-agent-context",
  momentum: "bg-agent-momentum",
  wall: "bg-agent-wall",
  goal: "bg-agent-goal",
  corner: "bg-agent-corner",
  card: "bg-agent-card",
  crowd: "bg-agent-crowd",
  live: "bg-agent-live",
  debate: "bg-agent-debate",
  debrief: "bg-agent-debrief",
}

function AgentBadge({ agent, className, ...props }: AgentBadgeProps) {
  const agentColor = agentColorMap[agent]
  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      className={cn(
        "inline-flex items-center rounded-full border-transparent px-2.5 py-0.5 text-xs font-semibold text-white shadow-md transition-colors",
        agentColor,
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants, AgentBadge }
