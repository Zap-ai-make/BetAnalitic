import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CouponMatch {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  addedAt: Date
}

interface CouponStore {
  matches: CouponMatch[]
  addMatch: (match: CouponMatch) => boolean
  removeMatch: (matchId: string) => void
  clearCoupon: () => void
  isSelected: (matchId: string) => boolean
  count: () => number
}

const MAX_MATCHES = 10

export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      matches: [],

      addMatch: (match) => {
        const state = get()

        // Check if already selected
        if (state.isSelected(match.id)) {
          return false
        }

        // Check max limit
        if (state.matches.length >= MAX_MATCHES) {
          return false
        }

        set((state) => ({
          matches: [...state.matches, { ...match, addedAt: new Date() }],
        }))

        return true
      },

      removeMatch: (matchId) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== matchId),
        }))
      },

      clearCoupon: () => {
        set({ matches: [] })
      },

      isSelected: (matchId) => {
        return get().matches.some((m) => m.id === matchId)
      },

      count: () => {
        return get().matches.length
      },
    }),
    {
      name: "betanalytic-coupon-storage",
    }
  )
)
