/**
 * Live Mode Store
 * Story 7.1: Global state management for Live Mode activation
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LiveModeState {
  /** Active matches in Live Mode (matchId → timestamp) */
  activeMatches: Map<string, number>

  /** Global Live Mode enabled */
  isLiveModeEnabled: boolean

  /** Battery saver mode (reduces refresh frequency) */
  isBatterySaverOn: boolean

  /** Actions */
  activateLiveMode: (matchId: string) => void
  deactivateLiveMode: (matchId: string) => void
  toggleLiveMode: (matchId: string) => void
  isMatchLive: (matchId: string) => boolean
  clearAllLiveMatches: () => void
  setBatterySaver: (enabled: boolean) => void
}

export const useLiveModeStore = create<LiveModeState>()(
  persist(
    (set, get) => ({
      activeMatches: new Map(),
      isLiveModeEnabled: false,
      isBatterySaverOn: false,

      activateLiveMode: (matchId) => {
        const newMap = new Map(get().activeMatches)
        newMap.set(matchId, Date.now())
        set({ activeMatches: newMap, isLiveModeEnabled: true })
      },

      deactivateLiveMode: (matchId) => {
        const newMap = new Map(get().activeMatches)
        newMap.delete(matchId)
        set({
          activeMatches: newMap,
          isLiveModeEnabled: newMap.size > 0,
        })
      },

      toggleLiveMode: (matchId) => {
        const isActive = get().activeMatches.has(matchId)
        if (isActive) {
          get().deactivateLiveMode(matchId)
        } else {
          get().activateLiveMode(matchId)
        }
      },

      isMatchLive: (matchId) => get().activeMatches.has(matchId),

      clearAllLiveMatches: () =>
        set({ activeMatches: new Map(), isLiveModeEnabled: false }),

      setBatterySaver: (enabled) => set({ isBatterySaverOn: enabled }),
    }),
    {
      name: "live-mode-storage",
      partialize: (state) => ({
        isBatterySaverOn: state.isBatterySaverOn,
      }),
    }
  )
)
