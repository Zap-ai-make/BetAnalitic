"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { useTypewriter } from "~/hooks/useTypewriter"

export interface TypewriterProps {
  text: string
  speed?: number
  punctuationPause?: number
  startDelay?: number
  className?: string
  cursorClassName?: string
  showCursor?: boolean
  autoScroll?: boolean
  onComplete?: () => void
}

export function Typewriter({
  text,
  speed = 30,
  punctuationPause = 100,
  startDelay = 0,
  className,
  cursorClassName,
  showCursor = true,
  autoScroll = true,
  onComplete,
}: TypewriterProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { displayText, isTyping, isComplete } = useTypewriter({
    text,
    speed,
    punctuationPause,
    startDelay,
    onComplete,
  })

  React.useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayText, autoScroll])

  return (
    <div ref={containerRef} className={cn("overflow-auto", className)}>
      <span>{displayText}</span>
      {showCursor && (isTyping || !isComplete) && (
        <span
          className={cn(
            "inline-block w-0.5 h-[1em] ml-0.5 align-middle",
            "bg-current animate-pulse",
            cursorClassName
          )}
        />
      )}
    </div>
  )
}
