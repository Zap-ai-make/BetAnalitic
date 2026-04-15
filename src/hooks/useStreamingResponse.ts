import { useState, useCallback, useRef, useEffect } from "react"

type StreamingState = "idle" | "connecting" | "streaming" | "complete" | "error" | "interrupted"

interface UseStreamingResponseOptions {
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
}

interface UseStreamingResponseReturn {
  response: string
  state: StreamingState
  error: string | null
  startStreaming: (agentId: string, query: string, context?: {
    matchId?: string
    conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>
  }) => Promise<void>
  stopStreaming: () => void
  reset: () => void
}

export function useStreamingResponse(
  options: UseStreamingResponseOptions = {}
): UseStreamingResponseReturn {
  const [response, setResponse] = useState("")
  const [state, setState] = useState<StreamingState>("idle")
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const accumulatedResponseRef = useRef("")

  /**
   * Start streaming from agent
   */
  const startStreaming = useCallback(
    async (
      agentId: string,
      query: string,
      context?: {
        matchId?: string
        conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>
      }
    ) => {
      // Reset state
      setResponse("")
      setError(null)
      accumulatedResponseRef.current = ""
      setState("connecting")

      // Create new abort controller
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await fetch("/api/agents/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId,
            query,
            matchId: context?.matchId,
            conversationHistory: context?.conversationHistory,
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        setState("streaming")

        // Parse SSE stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete lines
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6)
              try {
                const parsed = JSON.parse(data) as {
                  type: string
                  content?: string
                  message?: string
                }

                if (parsed.type === "token" && parsed.content) {
                  accumulatedResponseRef.current += parsed.content
                  setResponse(accumulatedResponseRef.current)
                } else if (parsed.type === "done") {
                  setState("complete")
                  options.onComplete?.(accumulatedResponseRef.current)
                } else if (parsed.type === "error") {
                  throw new Error(parsed.message ?? "Streaming error")
                }
              } catch (parseError) {
                console.warn("Failed to parse SSE data:", data)
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setState("interrupted")
          } else {
            setState("error")
            setError(err.message)
            options.onError?.(err)
          }
        } else {
          setState("error")
          setError(String(err))
        }
      } finally {
        abortControllerRef.current = null
      }
    },
    [options]
  )

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setState("interrupted")
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setResponse("")
    setState("idle")
    setError(null)
    accumulatedResponseRef.current = ""
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    response,
    state,
    error,
    startStreaming,
    stopStreaming,
    reset,
  }
}
