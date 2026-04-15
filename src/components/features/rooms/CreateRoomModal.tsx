"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { X, ChevronRight, AlertCircle } from "lucide-react"
import type { RoomVisibility } from "~/lib/realtime/types"

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateRoomData) => void
  isPremium: boolean
  currentRoomCount: number
  maxRooms: number
}

export interface CreateRoomData {
  name: string
  description: string
  color: string
  badge: string
  visibility: RoomVisibility
}

const COLORS = [
  "#00D4FF", // cyan
  "#10B981", // green
  "#F59E0B", // gold
  "#EC4899", // pink
  "#8B5CF6", // purple
  "#EF4444", // red
  "#6366F1", // indigo
  "#14B8A6", // teal
]

const BADGES = ["💬", "⚽", "🏆", "🎯", "🔥", "💰", "📊", "🎲", "🏅", "⭐"]

export function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  isPremium,
  currentRoomCount,
  maxRooms,
}: CreateRoomModalProps) {
  const [step, setStep] = React.useState(1)
  const [data, setData] = React.useState<CreateRoomData>({
    name: "",
    description: "",
    color: COLORS[0]!,
    badge: BADGES[0]!,
    visibility: "public",
  })
  const [error, setError] = React.useState<string | null>(null)

  const canCreate = currentRoomCount < maxRooms

  const handleSubmit = () => {
    if (!data.name.trim()) {
      setError("Le nom du salon est requis")
      return
    }

    if (data.name.length < 3) {
      setError("Le nom doit faire au moins 3 caractères")
      return
    }

    onCreate(data)
    onClose()
    setStep(1)
    setData({
      name: "",
      description: "",
      color: COLORS[0]!,
      badge: BADGES[0]!,
      visibility: "public",
    })
  }

  if (!isOpen) return null

  if (!isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-bg-secondary rounded-xl p-6 shadow-2xl">
          <div className="text-center">
            <div className="text-5xl mb-4">👑</div>
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">
              Fonctionnalité Premium
            </h3>
            <p className="text-text-secondary mb-6">
              La création de salons privés est réservée aux membres Premium.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-accent-gold text-bg-primary",
                "font-display font-semibold",
                "min-h-[44px]"
              )}
            >
              Devenir Premium
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-text-tertiary text-sm hover:text-text-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-bg-secondary rounded-xl p-6 shadow-2xl">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">
              Limite atteinte
            </h3>
            <p className="text-text-secondary mb-6">
              Vous avez atteint la limite de {maxRooms} salons. Archivez un
              salon existant pour en créer un nouveau.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-bg-tertiary text-text-primary",
                "font-display font-semibold",
                "min-h-[44px]"
              )}
            >
              Compris
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-bg-secondary rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-tertiary">
          <h3 className="font-display text-lg font-bold text-text-primary">
            Créer un salon
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  step >= s ? "bg-accent-cyan" : "bg-bg-tertiary"
                )}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nom du salon *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) =>
                    setData((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Mon super salon"
                  className={cn(
                    "w-full px-4 py-3 bg-bg-tertiary rounded-lg",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  )}
                  maxLength={30}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) =>
                    setData((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="Décrivez votre salon..."
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 bg-bg-tertiary rounded-lg resize-none",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  )}
                  maxLength={200}
                />
              </div>

              {error && (
                <p className="text-accent-red text-sm">{error}</p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, color }))}
                      className={cn(
                        "w-10 h-10 rounded-lg transition-transform",
                        data.color === color && "ring-2 ring-white scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, badge }))}
                      className={cn(
                        "w-10 h-10 rounded-lg bg-bg-tertiary text-xl",
                        "flex items-center justify-center transition-transform",
                        data.badge === badge && "ring-2 ring-accent-cyan scale-110"
                      )}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Visibilité
                </label>
                <div className="space-y-2">
                  {(["public", "invite-only"] as RoomVisibility[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, visibility: v }))}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg text-left",
                        "border-2 transition-colors",
                        data.visibility === v
                          ? "border-accent-cyan bg-accent-cyan/10"
                          : "border-bg-tertiary hover:border-bg-secondary"
                      )}
                    >
                      <p className="font-medium text-text-primary">
                        {v === "public" ? "🌍 Public" : "🔒 Sur invitation"}
                      </p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {v === "public"
                          ? "Visible et rejoignable par tous"
                          : "Uniquement accessible via lien d'invitation"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-bg-tertiary">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg",
                "bg-bg-tertiary text-text-secondary",
                "font-display font-semibold",
                "min-h-[44px]"
              )}
            >
              Retour
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (!data.name.trim()) {
                  setError("Le nom du salon est requis")
                  return
                }
                setError(null)
                setStep(2)
              }}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg",
                "bg-accent-cyan text-bg-primary",
                "font-display font-semibold",
                "min-h-[44px] flex items-center justify-center gap-2"
              )}
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg",
                "bg-accent-cyan text-bg-primary",
                "font-display font-semibold",
                "min-h-[44px]"
              )}
            >
              Créer le salon
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
