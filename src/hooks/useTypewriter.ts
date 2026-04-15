"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface UseTypewriterOptions {
  text: string
  speed?: number
  punctuationPause?: number
  startDelay?: number
  onComplete?: () => void
}

export interface UseTypewriterReturn {
  displayText: string
  isTyping: boolean
  isComplete: boolean
  reset: () => void
  skip: () => void
}

const PUNCTUATION = /[.,!?;:]/

export function useTypewriter({
  text,
  speed = 30,
  punctuationPause = 100,
  startDelay = 0,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const typeNextChar = useCallback(() => {
    if (indexRef.current >= text.length) {
      setIsTyping(false)
      setIsComplete(true)
      onComplete?.()
      return
    }

    const char = text[indexRef.current]
    indexRef.current++
    setDisplayText(text.slice(0, indexRef.current))

    const isPunctuation = PUNCTUATION.test(char ?? "")
    const delay = isPunctuation ? speed + punctuationPause : speed

    timeoutRef.current = setTimeout(typeNextChar, delay)
  }, [text, speed, punctuationPause, onComplete])

  const reset = useCallback(() => {
    clearTimer()
    indexRef.current = 0
    setDisplayText("")
    setIsTyping(false)
    setIsComplete(false)
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    indexRef.current = text.length
    setDisplayText(text)
    setIsTyping(false)
    setIsComplete(true)
    onComplete?.()
  }, [clearTimer, text, onComplete])

  useEffect(() => {
    reset()

    const startTimer = setTimeout(() => {
      setIsTyping(true)
      typeNextChar()
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearTimer()
    }
  }, [text, startDelay, reset, typeNextChar, clearTimer])

  return {
    displayText,
    isTyping,
    isComplete,
    reset,
    skip,
  }
}
