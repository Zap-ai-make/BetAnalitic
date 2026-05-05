"use client"

import { usePathname } from "next/navigation"
import { Header } from "./Header"
import { DashboardNav } from "./DashboardNav"

// Pages that provide their own back-button header
const NO_GLOBAL_HEADER = ["/notifications", "/subscription", "/referral", "/parrainage"]

export function AppShell() {
  const pathname = usePathname()

  const showGlobalHeader = !NO_GLOBAL_HEADER.some((p) => pathname.startsWith(p))
  // Hide bottom nav inside room channels (/salles/[roomId]/[channel])
  const showBottomNav = !/^\/salles\/[^/]+\/.+/.test(pathname)

  return (
    <>
      {showGlobalHeader && <Header />}
      {showBottomNav && <DashboardNav />}
    </>
  )
}
