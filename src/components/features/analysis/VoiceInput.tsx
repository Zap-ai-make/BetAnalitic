/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Mic, MicOff, Square } from "lucide-react"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, disabled = false, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [isSupported, setIsSupported] = React.useState(true)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "fr-FR"

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.[0]) {
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [])

  const startRecording = () => {
    if (!recognitionRef.current) return

    setTranscript("")
    setIsRecording(true)
    recognitionRef.current.start()

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50)
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsRecording(false)

    if (transcript) {
      onTranscript(transcript)
    }
  }

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "p-3 rounded-full bg-bg-tertiary text-text-tertiary cursor-not-allowed",
          "min-w-[44px] min-h-[44px]",
          className
        )}
        title="Reconnaissance vocale non supportée"
      >
        <MicOff className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Recording indicator */}
      {isRecording && transcript && (
        <div className="flex-1 px-3 py-2 bg-bg-tertiary rounded-lg text-sm text-text-secondary animate-pulse">
          {transcript}
        </div>
      )}

      {/* Record button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={cn(
          "p-3 rounded-full transition-all duration-200",
          "min-w-[44px] min-h-[44px] flex items-center justify-center",
          isRecording
            ? "bg-accent-red text-white animate-pulse"
            : "bg-bg-tertiary text-text-secondary hover:bg-accent-cyan hover:text-bg-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
      >
        {isRecording ? (
          <Square className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
