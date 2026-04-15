/**
 * Reformulation Protocol Enforcement
 * Story 4.15: Ensures agents follow output formatting standards
 */

export interface ReformulationRule {
  id: string
  name: string
  pattern: RegExp
  replacement: string
  description: string
}

// Rules for reformulating agent outputs
const REFORMULATION_RULES: ReformulationRule[] = [
  {
    id: "no-financial-advice",
    name: "No Financial Advice",
    pattern: /\b(you should bet|I recommend betting|guaranteed win|sure bet)\b/gi,
    replacement: "notre analyse suggère",
    description: "Replace direct betting advice with analytical language",
  },
  {
    id: "probability-language",
    name: "Probability Language",
    pattern: /\b(will definitely|100% chance|absolutely will)\b/gi,
    replacement: "a une forte probabilité de",
    description: "Replace certainty with probability language",
  },
  {
    id: "disclaimer-pattern",
    name: "Add Disclaimer",
    pattern: /^/,
    replacement: "",
    description: "Ensure disclaimer is present (handled separately)",
  },
]

// Standard disclaimer
const STANDARD_DISCLAIMER =
  "⚠️ Analyse à titre informatif. Les paris comportent des risques."

export interface ReformulationResult {
  originalText: string
  reformulatedText: string
  rulesApplied: string[]
  hasDisclaimer: boolean
}

/**
 * Apply reformulation rules to agent output
 */
export function reformulateOutput(text: string): ReformulationResult {
  let result = text
  const appliedRules: string[] = []

  // Apply each rule
  for (const rule of REFORMULATION_RULES) {
    if (rule.id !== "disclaimer-pattern" && rule.pattern.test(result)) {
      result = result.replace(rule.pattern, rule.replacement)
      appliedRules.push(rule.id)
    }
  }

  // Check/add disclaimer
  const hasDisclaimer =
    result.includes("⚠️") ||
    result.toLowerCase().includes("informatif") ||
    result.toLowerCase().includes("disclaimer")

  return {
    originalText: text,
    reformulatedText: result,
    rulesApplied: appliedRules,
    hasDisclaimer,
  }
}

/**
 * Add standard disclaimer if not present
 */
export function ensureDisclaimer(text: string): string {
  const result = reformulateOutput(text)
  if (!result.hasDisclaimer) {
    return `${result.reformulatedText}\n\n${STANDARD_DISCLAIMER}`
  }
  return result.reformulatedText
}

/**
 * Validate agent output against compliance rules
 */
export function validateCompliance(text: string): {
  isCompliant: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for prohibited content
  const prohibitedPatterns = [
    { pattern: /guaranteed.*win/gi, issue: "Claims guaranteed wins" },
    { pattern: /risk.?free/gi, issue: "Claims risk-free betting" },
    { pattern: /insider.*information/gi, issue: "References insider information" },
    { pattern: /fixed.*match/gi, issue: "References match fixing" },
  ]

  for (const { pattern, issue } of prohibitedPatterns) {
    if (pattern.test(text)) {
      issues.push(issue)
    }
  }

  return {
    isCompliant: issues.length === 0,
    issues,
  }
}
