"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "./Header"
import { DashboardNav } from "./DashboardNav"

// Pages that provide their own back-button header
const NO_GLOBAL_HEADER = ["/notifications", "/subscription", "/referral", "/parrainage"]

function NavProgressBar() {
  const pathname = usePathname()
  const prevRef = useRef(pathname)
  const [active, setActive] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevRef.current === pathname) return
    prevRef.current = pathname
    // Navigation completed — finish the bar
    setWidth(100)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setActive(false)
      setWidth(0)
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [pathname])

  // Expose start function via module event
  useEffect(() => {
    const onStart = () => {
      setActive(true)
      setWidth(30)
      timerRef.current = setTimeout(() => setWidth(70), 150)
    }
    window.addEventListener("nav-progress-start", onStart)
    return () => window.removeEventListener("nav-progress-start", onStart)
  }, [])

  if (!active && width === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-60 h-0.5 bg-accent-cyan transition-all"
      style={{
        width: `${width}%`,
        transitionDuration: width === 100 ? "200ms" : "400ms",
        transitionTimingFunction: width === 100 ? "ease-out" : "ease-in-out",
        opacity: active ? 1 : 0,
      }}
    />
  )
}

export function AppShell() {
  const pathname = usePathname()

  const showGlobalHeader = !NO_GLOBAL_HEADER.some((p) => pathname.startsWith(p))
  // Hide bottom nav inside room channels (/salles/[roomId]/[channel])
  const showBottomNav = !/^\/salles\/[^/]+\/.+/.test(pathname)

  return (
    <>
      <NavProgressBar />
      {showGlobalHeader && <Header />}
      {showBottomNav && <DashboardNav />}
    </>
  )
}
