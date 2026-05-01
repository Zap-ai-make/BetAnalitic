"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lang, setLang] = React.useState<"FR" | "EN">("FR")

  React.useEffect(() => {
    const stored = localStorage.getItem("betanalytic_lang")
    if (stored === "EN" || stored === "FR") setLang(stored)
  }, [])

  const toggleLang = () => {
    const next = lang === "FR" ? "EN" : "FR"
    setLang(next)
    localStorage.setItem("betanalytic_lang", next)
    window.dispatchEvent(new StorageEvent("storage", { key: "betanalytic_lang", newValue: next }))
  }

  // Unread badge: sum open tickets across all joined rooms
  const { data: unreadCounts } = api.room.getUnreadCounts.useQuery(undefined, {
    enabled: !!session?.user?.id,
    refetchInterval: 30_000,
    staleTime: 20_000,
  })
  const totalUnread = React.useMemo(
    () => (unreadCounts ?? []).reduce((s, r) => s + r.openTickets, 0),
    [unreadCounts]
  )

  const username = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "U"
  const userAvatar = session?.user?.image ?? undefined
  const initials = username.slice(0, 1).toUpperCase()
  const tier = session?.user?.subscriptionTier ?? "FREE"
  const isPro = tier === "PREMIUM" || tier === "EXPERT"

  return (
    <header
      className={cn("fixed top-0 z-50 w-full", "bg-bg-primary/95 backdrop-blur-sm", "border-b border-bg-tertiary/60")}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between h-14 px-4">

        {/* Logo + badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-display font-black text-2xl tracking-tight leading-none select-none"
            style={{
              background: "linear-gradient(105deg,#fff 0%,#00f0ff 45%,oklch(0.68 0.28 330) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
            }}
          >
            Bet<span style={{ fontStyle: "italic" }}>Analytic</span>
          </span>

          {/* Subscription badge */}
          <span
            className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest font-mono"
            style={isPro ? {
              background: "linear-gradient(90deg,oklch(0.82 0.19 78),oklch(0.68 0.28 330))",
              color: "#030509",
            } : {
              background: "rgba(255,255,255,0.06)",
              color: "#6b7280",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {isPro ? (tier === "EXPERT" ? "EXPERT" : "PRO") : "FREE"}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5">

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center justify-center h-7 px-2.5 rounded-md border transition-colors font-mono text-[10px] font-bold tracking-widest"
            style={{ color: "#00f0ff", borderColor: "rgba(0,240,255,0.25)", background: "rgba(0,240,255,0.06)" }}
          >
            {lang}
          </button>

          {/* Bell */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {totalUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-bg-primary" />
            )}
          </button>

          {/* Avatar */}
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent-cyan/40 transition-all ml-0.5"
            style={{ background: "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))", flexShrink: 0 }}
            aria-label="Profil"
          >
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-[12px]" style={{ color: "#030509" }}>{initials}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
