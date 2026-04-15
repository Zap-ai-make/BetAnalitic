"use client"

import { useRouter, usePathname } from "next/navigation"
import { BottomNav, type NavItem } from "./BottomNav"

const PATH_TO_NAV_ITEM: Record<string, NavItem> = {
  "/dashboard": "home",
  "/matches": "matches",
  "/analyse": "analysis",
  "/salles": "rooms",
  "/profile": "profile",
}

const NAV_ITEM_TO_PATH: Record<NavItem, string> = {
  home: "/dashboard",
  matches: "/matches",
  analysis: "/analyse",
  rooms: "/salles",
  profile: "/profile",
}

export function DashboardNav() {
  const router = useRouter()
  const pathname = usePathname()

  const activeItem: NavItem = PATH_TO_NAV_ITEM[pathname] ?? "home"

  const handleNavigate = (item: NavItem) => {
    const path = NAV_ITEM_TO_PATH[item]
    router.push(path)
  }

  return <BottomNav activeItem={activeItem} onNavigate={handleNavigate} />
}
