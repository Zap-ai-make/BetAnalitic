import { getAgentRegistry } from "./registry"
import { AGENTS } from "./config"

// Initialize registry with all agents
const registry = getAgentRegistry()
registry.registerMany(AGENTS)

export * from "./types"
export * from "./registry"
export * from "./config"
export { registry as agentRegistry }
