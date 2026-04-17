import { Ollama } from "ollama"

interface GenerateOptions {
  model: string
  prompt: string
  system?: string
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
  }
}

export class OllamaClient {
  private client: Ollama
  private baseUrl: string
  private healthCheckInterval: NodeJS.Timeout | null = null
  private isHealthy = false

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"
    this.client = new Ollama({ host: this.baseUrl })

    // Start health checks
    void this.startHealthChecks()
  }

  /**
   * Check if Ollama is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })

      this.isHealthy = response.ok

      if (!response.ok) {
        console.error("❌ Ollama health check failed:", response.statusText)
        return false
      }

      const data = (await response.json()) as { models: Array<{ name: string }> }
      console.log(`✅ Ollama healthy - ${data.models.length} models available`)
      return true
    } catch (error) {
      this.isHealthy = false
      console.error("❌ Ollama health check error:", error)
      return false
    }
  }

  /**
   * Start periodic health checks
   */
  private async startHealthChecks(): Promise<void> {
    // Initial check
    await this.healthCheck()

    // Check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      void this.healthCheck()
    }, 30000)
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): boolean {
    return this.isHealthy
  }

  /**
   * Generate a response (non-streaming)
   */
  async generate(options: GenerateOptions): Promise<string> {
    if (!this.isHealthy) {
      throw new Error("Ollama is not available")
    }

    try {
      const response = await this.client.generate({
        model: options.model,
        prompt: options.prompt,
        system: options.system,
        stream: false,
        options: options.options,
      })

      return response.response
    } catch (error) {
      console.error("❌ Ollama generate error:", error)
      throw new Error(
        `Ollama generation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(
    options: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isHealthy) {
      throw new Error("Ollama is not available")
    }

    try {
      const stream = await this.client.generate({
        model: options.model,
        prompt: options.prompt,
        system: options.system,
        stream: true,
        options: options.options,
      })

      for await (const chunk of stream) {
        if (chunk.response) {
          yield chunk.response
        }
      }
    } catch (error) {
      console.error("❌ Ollama stream error:", error)
      throw new Error(
        `Ollama streaming failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Chat with conversation history (non-streaming)
   */
  async chat(options: {
    model: string
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
    stream?: boolean
    options?: {
      temperature?: number
      top_p?: number
      top_k?: number
      num_predict?: number
    }
  }): Promise<string> {
    if (!this.isHealthy) {
      throw new Error("Ollama is not available")
    }

    try {
      const response = await this.client.chat({
        model: options.model,
        messages: options.messages,
        stream: false,
        options: options.options,
      })

      return response.message.content
    } catch (error) {
      console.error("❌ Ollama chat error:", error)
      throw new Error(
        `Ollama chat failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Chat with streaming response
   */
  async *chatStream(options: {
    model: string
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
    options?: {
      temperature?: number
      top_p?: number
      top_k?: number
      num_predict?: number
    }
  }): AsyncGenerator<string, void, unknown> {
    if (!this.isHealthy) {
      throw new Error("Ollama is not available")
    }

    try {
      const stream = await this.client.chat({
        model: options.model,
        messages: options.messages,
        stream: true,
        options: options.options,
      })

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          yield chunk.message.content
        }
      }
    } catch (error) {
      console.error("❌ Ollama chat stream error:", error)
      throw new Error(
        `Ollama chat streaming failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<Array<{ name: string; size: number }>> {
    try {
      const response = await this.client.list()
      return response.models.map((m) => ({
        name: m.name,
        size: m.size,
      }))
    } catch (error) {
      console.error("❌ Failed to list Ollama models:", error)
      return []
    }
  }
}

// Singleton instance
export const ollamaClient = new OllamaClient()
