"use client"

/**
 * Story 6.9: Share Agent Responses in Rooms
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Share2, Check, Users } from "lucide-react"

interface Room {
  id: string
  name: string
  memberCount: number
}

interface ShareAgentResponseProps {
  agentName: string
  responsePreview: string
  rooms: Room[]
  onShare: (roomId: string, content: string) => Promise<void>
  className?: string
}

export function ShareAgentResponse({
  agentName,
  responsePreview,
  rooms,
  onShare,
  className,
}: ShareAgentResponseProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedRoom, setSelectedRoom] = React.useState<string | null>(null)
  const [isSharing, setIsSharing] = React.useState(false)
  const [shared, setShared] = React.useState(false)

  const handleShare = async () => {
    if (!selectedRoom) return

    setIsSharing(true)
    try {
      const content = `📊 Analyse de ${agentName}:\n\n${responsePreview}`
      await onShare(selectedRoom, content)
      setShared(true)
      setTimeout(() => {
        setIsOpen(false)
        setShared(false)
        setSelectedRoom(null)
      }, 1500)
    } catch {
      // Handle error silently
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg text-text-tertiary hover:text-text-primary",
          "hover:bg-bg-tertiary transition-colors",
          "min-w-[44px] min-h-[44px] flex items-center justify-center"
        )}
        title="Partager dans un salon"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-bg-tertiary">
              <h4 className="font-display font-semibold text-text-primary text-sm">
                Partager dans un salon
              </h4>
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                {responsePreview.slice(0, 100)}...
              </p>
            </div>

            {rooms.length === 0 ? (
              <div className="p-4 text-center">
                <Users className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  Vous n&apos;êtes dans aucun salon
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room.id)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between",
                        "hover:bg-bg-tertiary transition-colors text-left",
                        selectedRoom === room.id && "bg-accent-cyan/10"
                      )}
                    >
                      <div>
                        <p className="font-medium text-text-primary text-sm">
                          {room.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {room.memberCount} membre{room.memberCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      {selectedRoom === room.id && (
                        <Check className="w-4 h-4 text-accent-cyan" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-bg-tertiary">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!selectedRoom || isSharing}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg font-medium text-sm",
                      "transition-colors min-h-[44px]",
                      selectedRoom && !isSharing
                        ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
                        : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                    )}
                  >
                    {shared ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Partagé !
                      </span>
                    ) : isSharing ? (
                      "Partage..."
                    ) : (
                      "Partager"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
