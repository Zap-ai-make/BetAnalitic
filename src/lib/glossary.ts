/**
 * Glossary of betting and football analysis terms
 */

export interface GlossaryTerm {
  term: string
  definition: string
  category: "market" | "stat" | "betting" | "general"
  example?: string
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Statistics
  {
    term: "xG",
    definition: "Expected Goals - Mesure la qualité des occasions de but créées par une équipe",
    category: "stat",
    example: "Une xG de 2.5 signifie qu'une équipe devrait normalement marquer 2-3 buts",
  },
  {
    term: "PPDA",
    definition: "Passes autorisées par action défensive - Mesure l'intensité du pressing",
    category: "stat",
    example: "Un PPDA de 8 indique un pressing intense (moins de passes autorisées)",
  },
  {
    term: "Forme",
    definition: "Performance récente d'une équipe sur ses 5 derniers matchs",
    category: "stat",
    example: "V-V-N-V-D signifie: Victoire, Victoire, Nul, Victoire, Défaite",
  },

  // Markets
  {
    term: "BTTS",
    definition: "Both Teams To Score - Pari où les deux équipes doivent marquer au moins 1 but",
    category: "market",
    example: "BTTS Oui = Paris gagné si le score est 1-1, 2-1, 2-2, etc.",
  },
  {
    term: "Over/Under",
    definition: "Pari sur le nombre total de buts marqués dans le match",
    category: "market",
    example: "Over 2.5 = Plus de 2.5 buts (3 buts ou plus pour gagner)",
  },
  {
    term: "Handicap",
    definition: "Avantage ou désavantage virtuel donné à une équipe",
    category: "market",
    example: "Handicap -1 pour Team A: Team A doit gagner par 2+ buts d'écart",
  },
  {
    term: "1X2",
    definition: "Pari classique sur le résultat: 1=Victoire domicile, X=Nul, 2=Victoire extérieur",
    category: "market",
    example: "Si vous pariez sur '1' et l'équipe à domicile gagne, vous gagnez",
  },

  // Betting Terms
  {
    term: "Cote",
    definition: "Multiplicateur de gain proposé par le bookmaker",
    category: "betting",
    example: "Cote 2.50: Un pari de 10€ rapporte 25€ (15€ de gain)",
  },
  {
    term: "Value Bet",
    definition: "Pari où la cote proposée est supérieure à la probabilité réelle",
    category: "betting",
    example: "Si une équipe a 50% de chances mais cote 2.50, c'est une value bet",
  },
  {
    term: "Bankroll",
    definition: "Capital total dédié aux paris sportifs",
    category: "betting",
    example: "Avec une bankroll de 1000€, ne risquez jamais plus de 2-5% par pari",
  },
  {
    term: "Stake",
    definition: "Montant misé sur un pari",
    category: "betting",
    example: "Un stake de 10€ sur une cote de 2.00",
  },
  {
    term: "Combiné",
    definition: "Pari regroupant plusieurs sélections (toutes doivent être gagnantes)",
    category: "betting",
    example: "3 matchs en combiné: cotes multipliées mais tous doivent gagner",
  },

  // General Terms
  {
    term: "H2H",
    definition: "Head to Head - Confrontations directes historiques entre deux équipes",
    category: "general",
    example: "PSG vs OM: 5 victoires PSG, 2 nuls, 3 victoires OM sur les 10 derniers H2H",
  },
  {
    term: "Momentum",
    definition: "Dynamique actuelle d'une équipe (série de résultats)",
    category: "general",
    example: "Une équipe sur une série de 5 victoires a un fort momentum positif",
  },
  {
    term: "Clean Sheet",
    definition: "Match sans encaisser de but",
    category: "general",
    example: "Le gardien garde sa cage inviolée pendant tout le match",
  },
]

/**
 * Get term definition by name
 */
export function getTermDefinition(term: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(
    (t) => t.term.toLowerCase() === term.toLowerCase()
  )
}

/**
 * Get all terms by category
 */
export function getTermsByCategory(
  category: GlossaryTerm["category"]
): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter((t) => t.category === category)
}

/**
 * Check if text contains any glossary terms
 */
export function findTermsInText(text: string): string[] {
  const foundTerms: string[] = []
  GLOSSARY_TERMS.forEach((glossaryTerm) => {
    const regex = new RegExp(`\\b${glossaryTerm.term}\\b`, "gi")
    if (regex.test(text)) {
      foundTerms.push(glossaryTerm.term)
    }
  })
  return foundTerms
}
