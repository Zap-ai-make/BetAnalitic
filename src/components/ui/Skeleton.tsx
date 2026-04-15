"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  animation?: "shimmer" | "pulse" | "none"
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "shimmer",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        animation === "shimmer" && "animate-shimmer bg-gradient-to-r from-bg-secondary via-bg-tertiary to-bg-secondary bg-[length:200%_100%]",
        animation === "pulse" && "animate-pulse",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  )
}

export interface SkeletonTextProps {
  lines?: number
  className?: string
  lineClassName?: string
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 && "w-3/4",
            lineClassName
          )}
        />
      ))}
    </div>
  )
}

export interface SkeletonCardProps {
  className?: string
  showAvatar?: boolean
  showImage?: boolean
}

export function SkeletonCard({
  className,
  showAvatar = true,
  showImage = false,
}: SkeletonCardProps) {
  return (
    <div className={cn("bg-bg-secondary rounded-lg p-4 space-y-4", className)}>
      {showImage && (
        <Skeleton variant="rectangular" height={120} className="w-full" />
      )}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="text" className="w-1/4 h-3" />
          </div>
        </div>
      )}
      <SkeletonText lines={3} />
    </div>
  )
}
