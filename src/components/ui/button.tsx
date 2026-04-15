import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        primary:
          "bg-[var(--gradient-logo)] text-white font-semibold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]",
        secondary:
          "bg-transparent border-2 border-accent-cyan text-accent-cyan font-medium hover:bg-accent-cyan/10",
        ghost:
          "bg-transparent text-text-secondary hover:bg-bg-secondary",
        agentInvoke:
          "bg-[var(--gradient-logo)] text-white font-semibold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] animate-pulse-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-11 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  agent?: "scout" | "insider" | "referee" | "tactic" | "context" | "momentum" | "wall" | "goal" | "corner" | "card" | "crowd" | "live" | "debate" | "debrief"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, agent, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Agent-specific styling for agentInvoke variant
    const agentStyle = agent && variant === "agentInvoke" ? {
      background: `linear-gradient(135deg, var(--color-agent-${agent}) 0%, var(--color-accent-cyan) 100%)`,
      boxShadow: `0 0 20px rgba(0, 212, 255, 0.3)`,
    } : undefined

    return (
      <Comp
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        className={cn(buttonVariants({ variant, size, className }))}
        style={agentStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
