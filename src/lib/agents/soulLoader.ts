import fs from "fs"
import path from "path"

interface SoulConfig {
  agentId: string
  content: string
  mission: string
  personality: string[]
  capabilities: string[]
  approach: string[]
  responseFormat: string
  dataSources: string[]
  limits: string[]
}

export class SoulLoader {
  private soulsDir: string
  private cache = new Map<string, SoulConfig>()

  constructor() {
    this.soulsDir = path.join(process.cwd(), "public", "agents", "souls")
  }

  /**
   * Load SOUL.md for a specific agent
   */
  loadSoul(agentId: string): SoulConfig {
    // Check cache first
    if (this.cache.has(agentId)) {
      return this.cache.get(agentId)!
    }

    const soulPath = path.join(this.soulsDir, `${agentId}.md`)

    if (!fs.existsSync(soulPath)) {
      throw new Error(`SOUL.md not found for agent: ${agentId}`)
    }

    const content = fs.readFileSync(soulPath, "utf-8")
    const parsed = this.parseSoulContent(agentId, content)

    // Cache it
    this.cache.set(agentId, parsed)

    return parsed
  }

  /**
   * Parse SOUL.md content into structured format
   */
  private parseSoulContent(agentId: string, content: string): SoulConfig {
    const lines = content.split("\n")

    let mission = ""
    const personality: string[] = []
    const capabilities: string[] = []
    const approach: string[] = []
    const dataSources: string[] = []
    const limits: string[] = []
    let responseFormat = ""

    let currentSection = ""
    let inCodeBlock = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Detect code blocks for response format
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock
        if (currentSection === "Format de Réponse") {
          if (inCodeBlock) {
            responseFormat += "\n"
          }
        }
        continue
      }

      // Section detection
      if (trimmed.startsWith("## Mission")) {
        currentSection = "Mission"
        continue
      } else if (trimmed.startsWith("## Personnalité")) {
        currentSection = "Personnalité"
        continue
      } else if (trimmed.startsWith("## Capacités")) {
        currentSection = "Capacités"
        continue
      } else if (trimmed.startsWith("## Approche Analytique")) {
        currentSection = "Approche"
        continue
      } else if (trimmed.startsWith("## Format de Réponse")) {
        currentSection = "Format de Réponse"
        continue
      } else if (trimmed.startsWith("## Données Utilisées")) {
        currentSection = "Données"
        continue
      } else if (trimmed.startsWith("## Limites")) {
        currentSection = "Limites"
        continue
      }

      // Extract content based on section
      if (currentSection === "Mission" && trimmed && !trimmed.startsWith("#")) {
        mission = trimmed
      } else if (
        currentSection === "Personnalité" &&
        trimmed.startsWith("- ")
      ) {
        personality.push(trimmed.substring(2))
      } else if (currentSection === "Capacités" && trimmed.startsWith("- ")) {
        capabilities.push(trimmed.substring(2))
      } else if (currentSection === "Approche" && trimmed.match(/^\d+\./)) {
        approach.push(trimmed)
      } else if (
        currentSection === "Format de Réponse" &&
        (inCodeBlock || trimmed)
      ) {
        responseFormat += line + "\n"
      } else if (currentSection === "Données" && trimmed.startsWith("- ")) {
        dataSources.push(trimmed.substring(2))
      } else if (currentSection === "Limites" && trimmed.startsWith("- ")) {
        limits.push(trimmed.substring(2))
      }
    }

    return {
      agentId,
      content,
      mission,
      personality,
      capabilities,
      approach,
      responseFormat: responseFormat.trim(),
      dataSources,
      limits,
    }
  }

  /**
   * Build system prompt from SOUL config
   */
  buildSystemPrompt(soul: SoulConfig, context?: {
    matchId?: string
    conversationHistory?: Array<{ role: string; content: string }>
  }): string {
    let prompt = `# Agent: ${soul.agentId}\n\n`
    prompt += `## Mission\n${soul.mission}\n\n`

    if (soul.personality.length > 0) {
      prompt += `## Personnalité\n`
      for (const trait of soul.personality) {
        prompt += `- ${trait}\n`
      }
      prompt += `\n`
    }

    if (soul.capabilities.length > 0) {
      prompt += `## Capacités\n`
      for (const cap of soul.capabilities) {
        prompt += `- ${cap}\n`
      }
      prompt += `\n`
    }

    if (soul.approach.length > 0) {
      prompt += `## Approche Analytique\n`
      for (const step of soul.approach) {
        prompt += `${step}\n`
      }
      prompt += `\n`
    }

    if (soul.responseFormat) {
      prompt += `## Format de Réponse\n${soul.responseFormat}\n\n`
    }

    if (soul.limits.length > 0) {
      prompt += `## IMPORTANT - Limites\n`
      for (const limit of soul.limits) {
        prompt += `- ${limit}\n`
      }
      prompt += `\n`
    }

    // Add context if provided
    if (context?.matchId) {
      prompt += `## Match Context\nMatch ID: ${context.matchId}\n\n`
    }

    prompt += `## Instructions\n`
    prompt += `- Réponds TOUJOURS en français\n`
    prompt += `- Adopte le ton et la personnalité décrits ci-dessus\n`
    prompt += `- Structure ta réponse selon le format défini\n`
    prompt += `- Ne fournis JAMAIS de pronostics directs ou garanties\n`
    prompt += `- Concentre-toi sur l'analyse factuelle et les insights\n`

    return prompt
  }

  /**
   * Preload all SOUL.md files
   */
  preloadAll(): void {
    if (!fs.existsSync(this.soulsDir)) {
      console.warn(`⚠️  SOUL directory not found: ${this.soulsDir}`)
      return
    }

    const files = fs.readdirSync(this.soulsDir)
    const soulFiles = files.filter((f) => f.endsWith(".md") && f !== "_template.md")

    console.log(`📚 Loading ${soulFiles.length} SOUL.md files...`)

    for (const file of soulFiles) {
      const agentId = file.replace(".md", "")
      try {
        this.loadSoul(agentId)
        console.log(`  ✅ Loaded SOUL for agent: ${agentId}`)
      } catch (error) {
        console.error(`  ❌ Failed to load SOUL for ${agentId}:`, error)
      }
    }

    console.log(`✅ Preloaded ${this.cache.size} SOUL configurations`)
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
export const soulLoader = new SoulLoader()
