/**
 * OpenClaw Client - Connects to OpenClaw instance on VPS
 */

interface OpenClawMessage {
  agentId: string
  query: string
  context?: {
    matchId?: string
    userId: string
    conversationHistory?: Array<{
      role: "system" | "user" | "assistant"
      content: string
    }>
    userPreferences?: {
      mode?: "analytical" | "supporter"
      expertiseLevel?: "beginner" | "intermediate" | "expert"
    }
  }
}

interface OpenClawResponse {
  type: "start" | "token" | "done" | "error"
  content?: string
  message?: string
  metadata?: {
    agentId: string
    model?: string
    latency?: number
  }
}

export class OpenClawClient {
  private baseUrl: string
  private apiKey: string
  private isHealthy = false

  constructor() {
    this.baseUrl = process.env.OPENCLAW_BASE_URL ?? "http://localhost:8000"
    this.apiKey = process.env.OPENCLAW_API_KEY ?? ""

    if (!this.apiKey) {
      console.warn("⚠️  OPENCLAW_API_KEY not configured")
    }
  }

  /**
   * Health check for OpenClaw VPS connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey,
        },
        signal: AbortSignal.timeout(5000),
      })

      this.isHealthy = response.ok

      if (response.ok) {
        console.log("✅ OpenClaw VPS connection healthy")
      } else {
        console.error("❌ OpenClaw VPS health check failed:", response.statusText)
      }

      return response.ok
    } catch (error) {
      this.isHealthy = false
      console.error("❌ OpenClaw VPS connection error:", error)
      return false
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): boolean {
    return this.isHealthy
  }

  /**
   * Send query to OpenClaw (non-streaming)
   */
  async invoke(message: OpenClawMessage): Promise<string> {
    if (!this.isHealthy) {
      throw new Error("OpenClaw is not available")
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/agents/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenClaw invoke failed: ${error}`)
      }

      const data = (await response.json()) as { response: string }
      return data.response
    } catch (error) {
      console.error("❌ OpenClaw invoke error:", error)
      throw new Error(
        `OpenClaw invocation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Send query to OpenClaw with streaming response
   */
  async *invokeStream(
    message: OpenClawMessage
  ): AsyncGenerator<OpenClawResponse, void, unknown> {
    if (!this.isHealthy) {
      throw new Error("OpenClaw is not available")
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/agents/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenClaw stream failed: ${error}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

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
              const parsed = JSON.parse(data) as OpenClawResponse
              yield parsed
            } catch {
              console.warn("Failed to parse SSE data:", data)
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ OpenClaw stream error:", error)
      throw new Error(
        `OpenClaw streaming failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(): void {
    // Initial check
    void this.healthCheck()

    // Check every 30 seconds
    setInterval(() => {
      void this.healthCheck()
    }, 30000)
  }
}

// Singleton instance
export const openclawClient = new OpenClawClient()

// Start health checks on import
openclawClient.startHealthChecks()
