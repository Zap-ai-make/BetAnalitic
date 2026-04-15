"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
  disabled?: boolean
}

export interface UsePullToRefreshReturn {
  pullDistance: number
  isPulling: boolean
  isRefreshing: boolean
  isSuccess: boolean
  progress: number
  rotation: number
  containerRef: React.RefObject<HTMLDivElement>
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 180

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      if (scrollTop > 0) return

      startYRef.current = e.touches[0]?.clientY ?? 0
      currentYRef.current = startYRef.current
      setIsPulling(true)
    },
    [disabled, isRefreshing]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return

      currentYRef.current = e.touches[0]?.clientY ?? 0
      const delta = currentYRef.current - startYRef.current

      if (delta > 0) {
        e.preventDefault()
        const dampedDelta = Math.min(delta * 0.5, maxPull)
        setPullDistance(dampedDelta)
      }
    },
    [isPulling, disabled, isRefreshing, maxPull]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold * 0.6)

      onRefresh()
        .then(() => {
          setIsSuccess(true)
          setTimeout(() => {
            setIsSuccess(false)
            setIsRefreshing(false)
            setPullDistance(0)
          }, 500)
        })
        .catch(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        })
    } else {
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    isSuccess,
    progress,
    rotation,
    containerRef,
  }
}
