import { create } from "zustand"
import { persist } from "zustand/middleware"

export type BetMarket = "1X2:1" | "1X2:X" | "1X2:2" | "BTTS:yes" | "BTTS:no" | "O25" | "U25"
export type SlipMode = "single" | "combo"

export interface BetSelection {
  matchId: string
  homeTeam: string
  awayTeam: string
  competition: string
  market: BetMarket
  label: string
  odds: number
}

export interface CachedMatchOdds {
  home: number
  draw: number
  away: number
  bttsYes: number
  bttsNo: number
  over25: number
  under25: number
}

interface BetSlipStore {
  selections: BetSelection[]
  mode: SlipMode
  stake: number
  stakes: Record<string, number>
  oddsCache: Record<string, CachedMatchOdds>
  isOpen: boolean

  addSelection: (sel: BetSelection) => void
  removeSelection: (matchId: string, market?: BetMarket) => void
  setMode: (mode: SlipMode) => void
  setStake: (stake: number) => void
  setMatchStake: (matchId: string, stake: number) => void
  clearSlip: () => void
  cacheOdds: (matchId: string, odds: CachedMatchOdds) => void
  getCachedOdds: (matchId: string) => CachedMatchOdds | null
  isSelected: (matchId: string, market: BetMarket) => boolean
  comboOdds: () => number
  totalStake: () => number
  potentialWin: () => number
  openSlip: () => void
  closeSlip: () => void
}

function applyMargin(prob: number, overround: number): number {
  const raw = 1 / prob
  return Math.round((raw / overround) * 100) / 100
}

export function poissonToOdds(
  homePct: number,
  drawPct: number,
  awayPct: number
): CachedMatchOdds {
  const margin = 1.06
  const home = applyMargin(homePct, margin)
  const draw = applyMargin(drawPct, margin)
  const away = applyMargin(awayPct, margin)

  // Approx BTTS & O/U from match probabilities
  const bttsProb = Math.min(0.8, homePct * 1.4 + awayPct * 1.4)
  const over25Prob = Math.min(0.85, homePct * 0.9 + awayPct * 0.9)

  return {
    home: Math.max(1.05, home),
    draw: Math.max(1.05, draw),
    away: Math.max(1.05, away),
    bttsYes: Math.max(1.05, applyMargin(bttsProb, margin)),
    bttsNo: Math.max(1.05, applyMargin(1 - bttsProb, margin)),
    over25: Math.max(1.05, applyMargin(over25Prob, margin)),
    under25: Math.max(1.05, applyMargin(1 - over25Prob, margin)),
  }
}

export const useBetSlipStore = create<BetSlipStore>()(
  persist(
    (set, get) => ({
      selections: [],
      mode: "combo",
      stake: 100,
      stakes: {},
      oddsCache: {},
      isOpen: false,

      addSelection: (sel) => {
        set((state) => {
          // Replace existing selection for same match (one market per match)
          const without = state.selections.filter((s) => s.matchId !== sel.matchId)
          // If same market clicked again → deselect
          const existing = state.selections.find(
            (s) => s.matchId === sel.matchId && s.market === sel.market
          )
          if (existing) return { selections: without }
          return {
            selections: [...without, sel],
            isOpen: true,
          }
        })
      },

      removeSelection: (matchId, market) => {
        set((state) => ({
          selections: market
            ? state.selections.filter((s) => !(s.matchId === matchId && s.market === market))
            : state.selections.filter((s) => s.matchId !== matchId),
        }))
      },

      setMode: (mode) => set({ mode }),
      setStake: (stake) => set({ stake }),

      setMatchStake: (matchId, stake) =>
        set((state) => ({ stakes: { ...state.stakes, [matchId]: stake } })),

      clearSlip: () => set({ selections: [], stakes: {}, isOpen: false }),

      cacheOdds: (matchId, odds) =>
        set((state) => ({ oddsCache: { ...state.oddsCache, [matchId]: odds } })),

      getCachedOdds: (matchId) => get().oddsCache[matchId] ?? null,

      isSelected: (matchId, market) =>
        get().selections.some((s) => s.matchId === matchId && s.market === market),

      comboOdds: () =>
        get().selections.reduce((acc, s) => acc * s.odds, 1),

      totalStake: () => {
        const { mode, stake, stakes, selections } = get()
        if (mode === "combo") return stake
        return selections.reduce((acc, s) => acc + (stakes[s.matchId] ?? stake), 0)
      },

      potentialWin: () => {
        const { mode, stake, stakes, selections } = get()
        if (mode === "combo") {
          const combined = selections.reduce((acc, s) => acc * s.odds, 1)
          return Math.round(stake * combined * 100) / 100
        }
        return selections.reduce((acc, s) => {
          const st = stakes[s.matchId] ?? stake
          return acc + st * s.odds
        }, 0)
      },

      openSlip: () => set({ isOpen: true }),
      closeSlip: () => set({ isOpen: false }),
    }),
    {
      name: "betanalytic-betslip",
      partialize: (state) => ({
        selections: state.selections,
        mode: state.mode,
        stake: state.stake,
        stakes: state.stakes,
        oddsCache: state.oddsCache,
      }),
    }
  )
)
