"use client"

import { useCallback } from "react"

export interface UseHapticOptions {
  duration?: number
  fallbackToSound?: boolean
}

export function useHaptic(options: UseHapticOptions = {}) {
  const { duration = 10, fallbackToSound = false } = options

  const trigger = useCallback(() => {
    // Check for Navigator Vibration API
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(duration)
        return true
      } catch {
        // Vibration not supported or blocked
      }
    }

    // Optional audio fallback for unsupported devices
    if (fallbackToSound && typeof AudioContext !== "undefined") {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 200
        gainNode.gain.value = 0.1

        oscillator.start()
        oscillator.stop(audioContext.currentTime + duration / 1000)

        return true
      } catch {
        // Audio not supported
      }
    }

    return false
  }, [duration, fallbackToSound])

  const isSupported =
    typeof navigator !== "undefined" && "vibrate" in navigator

  return {
    trigger,
    isSupported,
  }
}
