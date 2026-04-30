export const PREDICTION_MAP: Record<string, string> = {
  home: "V1", draw: "X", away: "V2",
  yes: "Oui", no: "Non", over: "Over", under: "Under",
}

export function predictionLabel(p: string): string {
  return PREDICTION_MAP[p] ?? p
}

export const SIGNAL_TYPE_LABELS: Record<"RESULT" | "BTTS" | "CORNERS" | "CARDS", string> = {
  RESULT: "Résultat", BTTS: "BTTS", CORNERS: "Corners", CARDS: "Cartons",
}
