"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Volume2, VolumeX, Pause } from "lucide-react"

interface TextToSpeechProps {
  text: string
  className?: string
}

type PlaybackSpeed = 0.75 | 1 | 1.5 | 2

export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [speed, setSpeed] = React.useState<PlaybackSpeed>(1)
  const [isSupported, setIsSupported] = React.useState(true)
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)

  React.useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false)
    }
  }, [])

  React.useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "fr-FR"
    utterance.rate = speed

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const handleSpeedChange = () => {
    const speeds: PlaybackSpeed[] = [0.75, 1, 1.5, 2]
    const currentIndex = speeds.indexOf(speed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setSpeed(speeds[nextIndex]!)

    // If playing, restart with new speed
    if (isPlaying) {
      handleStop()
      setTimeout(handlePlay, 100)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={isPlaying && !isPaused ? handlePause : handlePlay}
        className={cn(
          "p-2 rounded-lg transition-colors",
          "min-w-[44px] min-h-[44px] flex items-center justify-center",
          isPlaying
            ? "bg-accent-cyan/20 text-accent-cyan"
            : "text-text-tertiary hover:text-accent-cyan hover:bg-accent-cyan/10"
        )}
        aria-label={isPlaying ? "Pause" : "Écouter"}
        title={isPlaying ? "Pause" : "Écouter"}
      >
        {isPlaying && !isPaused ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Stop Button (only when playing) */}
      {isPlaying && (
        <button
          type="button"
          onClick={handleStop}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            "text-text-tertiary hover:text-accent-red hover:bg-accent-red/10"
          )}
          aria-label="Arrêter"
        >
          <VolumeX className="w-5 h-5" />
        </button>
      )}

      {/* Speed Button */}
      <button
        type="button"
        onClick={handleSpeedChange}
        className={cn(
          "px-2 py-1 rounded text-xs font-mono transition-colors",
          "min-h-[32px]",
          "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
        )}
        title="Vitesse de lecture"
      >
        {speed}x
      </button>
    </div>
  )
}
