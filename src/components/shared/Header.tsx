"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "~/lib/utils"
import { useCouponStore } from "~/lib/stores/couponStore"
import { useRouter } from "next/navigation"

export interface HeaderProps {
  notificationCount?: number
  userAvatar?: string
  userName?: string
  onLangSwitch?: () => void
  onNotificationClick?: () => void
  onUserClick?: () => void
  onSearchClick?: () => void
}

export function Header({
  notificationCount = 0,
  userAvatar,
  userName = "User",
  onLangSwitch,
  onNotificationClick,
  onUserClick,
  onSearchClick,
}: HeaderProps) {
  const router = useRouter()
  const couponCount = useCouponStore((state) => state.count())

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-bg-primary/95 backdrop-blur-sm",
        "border-b border-bg-tertiary"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="font-display font-bold text-xl bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-logo)" }}
          >
            BetAnalytic
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={onSearchClick}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "transition-colors duration-200",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="Search"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Coupon Badge */}
          <button
            type="button"
            onClick={() => router.push("/analysis")}
            className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "transition-colors duration-200",
              "min-h-[44px] min-w-[44px]",
              couponCount > 0 && "text-accent-cyan"
            )}
            aria-label={`Coupon${couponCount > 0 ? ` (${couponCount} matches)` : ""}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {couponCount > 0 && (
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5",
                  "flex items-center justify-center min-w-[18px] h-[18px] px-1",
                  "bg-accent-cyan text-bg-primary text-xs font-bold rounded-full"
                )}
              >
                {couponCount}
              </span>
            )}
          </button>

          {/* Lang Switch */}
          <button
            type="button"
            onClick={onLangSwitch}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "transition-colors duration-200",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="Switch language"
          >
            <span className="text-xl">🌐</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={onNotificationClick}
            className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "transition-colors duration-200",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notificationCount > 0 && (
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5",
                  "flex items-center justify-center min-w-[18px] h-[18px] px-1",
                  "bg-accent-red text-white text-xs font-bold rounded-full"
                )}
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            type="button"
            onClick={onUserClick}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full overflow-hidden",
              "bg-bg-secondary hover:ring-2 hover:ring-accent-cyan/50",
              "transition-all duration-200",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="User profile"
          >
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-semibold text-sm text-text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
