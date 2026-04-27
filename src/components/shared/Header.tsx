"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { useCouponStore } from "~/lib/stores/couponStore"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const couponCount = useCouponStore((state) => state.count())
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

  const username = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "U"
  const userAvatar = session?.user?.image ?? undefined
  const initials = username.slice(0, 1).toUpperCase()

  return (
    <header className={cn("sticky top-0 z-50 w-full", "bg-bg-primary/95 backdrop-blur-sm", "border-b border-bg-tertiary")}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <span
          className="font-display font-black text-xl tracking-tight"
          style={{ background: "linear-gradient(90deg,#fff 0%,#00f0ff 50%,oklch(0.68 0.28 330) 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textTransform: "uppercase" }}
        >
          Bet<em style={{ fontStyle: "normal" }}>Analytic</em>
        </span>

        <div className="flex items-center gap-0.5">
          {/* Search */}
          <button
            onClick={() => router.push("/matches")}
            className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Coupon badge */}
          <button
            onClick={() => router.push("/coupons")}
            className={cn("relative flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors", couponCount > 0 && "text-accent-cyan")}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {couponCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-[14px] h-[14px] bg-accent-cyan text-bg-primary text-[9px] font-bold rounded-full">
                {couponCount > 9 ? "9+" : couponCount}
              </span>
            )}
          </button>

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center justify-center h-7 px-2 rounded text-accent-cyan border border-bg-tertiary hover:bg-bg-secondary transition-colors font-mono text-[10px] font-bold tracking-widest"
          >
            {lang}
          </button>

          {/* Bell */}
          <button className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>

          {/* Avatar */}
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent-cyan/50 transition-all ml-1"
            style={{ background: "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))", flexShrink: 0 }}
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
