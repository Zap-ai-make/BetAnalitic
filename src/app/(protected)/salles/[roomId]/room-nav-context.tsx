"use client"

import * as React from "react"

interface RoomNavCtx { goToChannels: () => void }
export const RoomNavigationContext = React.createContext<RoomNavCtx>({ goToChannels: () => {} })
export function useRoomNavigation() { return React.useContext(RoomNavigationContext) }
