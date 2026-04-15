"use client"

/**
 * Story 6.15: Room Coupon Board
 * Shared betting slips display for collaborative rooms
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Plus, Trash2, CheckCircle, XCircle, Clock, Users, TrendingUp } from "lucide-react"

interface BetSelection {
  matchId: string
  matchName: string
  selection: string
  odds: number
}

interface SharedCoupon {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  selections: BetSelection[]
  stake: number
  potentialWin: number
  status: "pending" | "won" | "lost" | "void"
  createdAt: Date
  likes: number
  hasLiked?: boolean
}

interface RoomCouponBoardProps {
  coupons: SharedCoupon[]
  currentUserId: string
  onAddCoupon?: () => void
  onDeleteCoupon?: (couponId: string) => Promise<void>
  onLikeCoupon?: (couponId: string) => Promise<void>
  onCopyCoupon?: (coupon: SharedCoupon) => void
  className?: string
}

function CouponCard({
  coupon,
  isOwn,
  onDelete,
  onLike,
  onCopy,
}: {
  coupon: SharedCoupon
  isOwn: boolean
  onDelete?: () => void
  onLike?: () => void
  onCopy?: () => void
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
      label: "En cours",
    },
    won: {
      icon: CheckCircle,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      label: "Gagné",
    },
    lost: {
      icon: XCircle,
      color: "text-accent-red",
      bg: "bg-accent-red/10",
      label: "Perdu",
    },
    void: {
      icon: XCircle,
      color: "text-text-tertiary",
      bg: "bg-bg-tertiary",
      label: "Annulé",
    },
  }

  const status = statusConfig[coupon.status]
  const StatusIcon = status.icon

  const totalOdds = coupon.selections.reduce((acc, s) => acc * s.odds, 1)

  const handleDelete = () => {
    if (!onDelete) return
    setIsDeleting(true)
    void Promise.resolve(onDelete()).finally(() => {
      setIsDeleting(false)
    })
  }

  return (
    <div className="p-4 bg-bg-secondary border border-bg-tertiary rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm">
            {coupon.userAvatar ?? coupon.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {coupon.userName}
              {isOwn && (
                <span className="ml-2 text-xs text-text-tertiary">(vous)</span>
              )}
            </p>
            <p className="text-xs text-text-tertiary">
              {coupon.createdAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className={cn("px-2 py-1 rounded-full flex items-center gap-1", status.bg)}>
          <StatusIcon className={cn("w-3.5 h-3.5", status.color)} />
          <span className={cn("text-xs font-medium", status.color)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-2 mb-3">
        {coupon.selections.map((selection, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 px-3 bg-bg-tertiary rounded-lg text-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="text-text-primary truncate">{selection.matchName}</p>
              <p className="text-text-secondary text-xs">{selection.selection}</p>
            </div>
            <span className="font-mono font-medium text-accent-cyan ml-2">
              {selection.odds.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between py-2 px-3 bg-bg-tertiary rounded-lg mb-3">
        <div className="text-sm">
          <span className="text-text-tertiary">Mise:</span>{" "}
          <span className="text-text-primary font-medium">{coupon.stake}€</span>
        </div>
        <div className="text-sm">
          <span className="text-text-tertiary">Cote totale:</span>{" "}
          <span className="font-mono text-accent-cyan">{totalOdds.toFixed(2)}</span>
        </div>
        <div className="text-sm">
          <span className="text-text-tertiary">Gain:</span>{" "}
          <span
            className={cn(
              "font-medium",
              coupon.status === "won" ? "text-accent-green" : "text-text-primary"
            )}
          >
            {coupon.potentialWin.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onLike && (
          <button
            type="button"
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-lg text-sm",
              "transition-colors min-h-[44px]",
              coupon.hasLiked
                ? "bg-accent-cyan/20 text-accent-cyan"
                : "bg-bg-tertiary text-text-secondary hover:text-accent-cyan"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{coupon.likes}</span>
          </button>
        )}

        {onCopy && !isOwn && (
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors text-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Copier
          </button>
        )}

        {isOwn && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-auto p-2 rounded-lg text-text-tertiary hover:text-accent-red hover:bg-accent-red/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function RoomCouponBoard({
  coupons,
  currentUserId,
  onAddCoupon,
  onDeleteCoupon,
  onLikeCoupon,
  onCopyCoupon,
  className,
}: RoomCouponBoardProps) {
  const sortedCoupons = React.useMemo(() => {
    return [...coupons].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }, [coupons])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-text-secondary" />
          <h3 className="font-display font-semibold text-text-primary">
            Coupons partagés
          </h3>
          <span className="px-2 py-0.5 bg-bg-tertiary rounded-full text-xs text-text-tertiary">
            {coupons.length}
          </span>
        </div>

        {onAddCoupon && (
          <button
            type="button"
            onClick={onAddCoupon}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-accent-cyan text-bg-primary text-sm font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Partager
          </button>
        )}
      </div>

      {/* Empty state */}
      {sortedCoupons.length === 0 ? (
        <div className="p-8 text-center bg-bg-secondary rounded-xl border border-bg-tertiary border-dashed">
          <div className="text-4xl mb-3">🎟️</div>
          <p className="text-text-secondary text-sm">
            Aucun coupon partagé dans ce salon.
          </p>
          {onAddCoupon && (
            <p className="text-text-tertiary text-xs mt-1">
              Soyez le premier à partager votre combiné !
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              isOwn={coupon.userId === currentUserId}
              onDelete={
                onDeleteCoupon ? () => onDeleteCoupon(coupon.id) : undefined
              }
              onLike={
                onLikeCoupon ? () => onLikeCoupon(coupon.id) : undefined
              }
              onCopy={
                onCopyCoupon ? () => onCopyCoupon(coupon) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export type { SharedCoupon, BetSelection }
