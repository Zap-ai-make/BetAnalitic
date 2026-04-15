"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export interface StaggeredListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  staggerDelay?: number
  animationDuration?: number
  className?: string
  itemClassName?: string
  refreshKey?: number
}

export function StaggeredList<T>({
  items,
  renderItem,
  keyExtractor,
  staggerDelay = 50,
  animationDuration = 300,
  className,
  itemClassName,
  refreshKey = 0,
}: StaggeredListProps<T>) {
  const [visibleItems, setVisibleItems] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    setVisibleItems(new Set())

    items.forEach((item, index) => {
      const key = keyExtractor(item, index)
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, key]))
      }, index * staggerDelay)
    })
  }, [items, keyExtractor, staggerDelay, refreshKey])

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index)
        const isVisible = visibleItems.has(key)

        return (
          <div
            key={key}
            className={cn(
              "transition-all",
              itemClassName
            )}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transitionDuration: `${animationDuration}ms`,
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}
