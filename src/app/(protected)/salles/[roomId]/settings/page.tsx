"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import {
  ArrowLeft, Save, Trash2, Crown, Shield, User,
  Palette, Image, Info, Users, Check, X, AlertTriangle,
} from "lucide-react"
import { cn } from "~/lib/utils"

const PRESET_COLORS = [
  "#00D4FF", "#FF6B6B", "#4ECDC4", "#FFE66D", "#A855F7",
  "#F97316", "#22C55E", "#EC4899", "#EAB308", "#6366F1",
]

const PRESET_BADGES = ["⚽", "🏆", "🔥", "⚡", "🎯", "💎", "🦁", "🦅", "🌟", "🏅", "🎖️", "🤖"]

// ── Section wrapper ────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="bg-bg-secondary border border-bg-tertiary rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-tertiary">
        <Icon className="w-4 h-4 text-text-tertiary" />
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

// ── Cover image preview ────────────────────────────────────────
function CoverPreview({ url, badge, color }: { url: string | null; badge: string | null; color: string }) {
  return (
    <div
      className="relative w-full h-28 rounded-xl overflow-hidden flex items-end"
      style={{ background: url ? undefined : `linear-gradient(135deg, ${color}40, ${color}10)` }}
    >
      {url && (
        <img src={url} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      {badge && (
        <span className="absolute top-3 left-3 text-2xl">{badge}</span>
      )}
      <div className="relative px-3 pb-3">
        <div className="w-5 h-0.5 rounded-full" style={{ background: color }} />
      </div>
    </div>
  )
}

// ── Member Row ─────────────────────────────────────────────────
function MemberRow({ member, isMe, isOwner, onKick }: {
  member: {
    userId: string; userName: string; userAvatar: string | null; role: string; isAgent: boolean; agentEmoji: string | null; agentColor: string | null
  }
  isMe: boolean; isOwner: boolean; onKick: () => void
}) {
  const [confirm, setConfirm] = React.useState(false)

  if (member.isAgent) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ background: `${member.agentColor ?? "#00D4FF"}20` }}>
          {member.agentEmoji ?? "🤖"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{member.userName}</p>
          <p className="text-xs text-text-tertiary">Agent IA</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium shrink-0">
          Agent
        </span>
      </div>
    )
  }

  const initials = member.userName.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 py-2">
      {member.userAvatar
        ? <img src={member.userAvatar} alt={member.userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
        : <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-bold text-accent-cyan shrink-0">{initials}</div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{member.userName}{isMe && <span className="text-text-tertiary text-xs ml-1">(vous)</span>}</p>
        <p className="text-xs text-text-tertiary capitalize">{member.role.toLowerCase()}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {member.role === "OWNER" && <Crown className="w-3.5 h-3.5 text-accent-gold" />}
        {member.role === "ADMIN" && <Shield className="w-3.5 h-3.5 text-accent-cyan" />}
        {member.role === "MEMBER" && <User className="w-3.5 h-3.5 text-text-tertiary" />}
        {isOwner && !isMe && member.role !== "OWNER" && (
          confirm ? (
            <div className="flex items-center gap-1">
              <button onClick={onKick} className="p-1 text-red-400 hover:text-red-300 rounded transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setConfirm(false)} className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} className="p-1 text-text-tertiary hover:text-red-400 rounded transition-colors ml-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>
    </div>
  )
}

// ── Main settings page ─────────────────────────────────────────
export default function RoomSettingsPage() {
  const params = useParams<{ roomId: string }>()
  const { roomId } = params
  const router = useRouter()
  const { data: session } = useSession()
  const utils = api.useUtils()

  const { data: room, isLoading } = api.room.getById.useQuery({ roomId })
  const { data: members } = api.room.getMembers.useQuery({ roomId })

  // Form state
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [color, setColor] = React.useState("#00D4FF")
  const [badge, setBadge] = React.useState("")
  const [coverImage, setCoverImage] = React.useState("")
  const [visibility, setVisibility] = React.useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PUBLIC")
  const [saved, setSaved] = React.useState(false)

  // Init form from room data
  React.useEffect(() => {
    if (!room) return
    setName(room.name)
    setDescription(room.description ?? "")
    setColor(room.color)
    setBadge(room.badge ?? "")
    setCoverImage(room.coverImage ?? "")
    setVisibility(room.visibility as "PUBLIC" | "PRIVATE" | "INVITE_ONLY")
  }, [room])

  const updateMutation = api.room.updateRoom.useMutation({
    onSuccess: async () => {
      await utils.room.getById.invalidate({ roomId })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const kickMutation = api.room.kickUser.useMutation({
    onSuccess: () => utils.room.getMembers.invalidate({ roomId }),
  })

  const currentUserId = session?.user?.id ?? ""
  const isOwner = room?.ownerId === currentUserId

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Chargement…</div>
  }

  if (!room || !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
        <AlertTriangle className="w-10 h-10 text-text-tertiary/50" />
        <p className="font-semibold text-text-primary">Accès refusé</p>
        <p className="text-sm text-text-tertiary">Seul le créateur peut accéder aux paramètres</p>
        <button onClick={() => router.back()} className="text-sm text-accent-cyan hover:underline">Retour</button>
      </div>
    )
  }

  const humanMembers = (members ?? []).filter((m) => !m.isAgent)
  const agentMembers = (members ?? []).filter((m) => m.isAgent)

  function handleSave() {
    updateMutation.mutate({
      roomId,
      name: name.trim() || undefined,
      description: description.trim() || null,
      color,
      badge: badge.trim() || null,
      coverImage: coverImage.trim() || null,
      visibility,
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-tertiary shrink-0 bg-bg-primary">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-semibold text-text-primary flex-1">Paramètres de la salle</h1>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !name.trim() || name.trim().length < 3}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
            saved
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-accent-cyan text-bg-primary disabled:opacity-40"
          )}
        >
          {saved ? <><Check className="w-3.5 h-3.5" />Sauvegardé</> : <><Save className="w-3.5 h-3.5" />Sauvegarder</>}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">

        {/* Preview */}
        <CoverPreview url={coverImage || null} badge={badge || null} color={color} />

        {/* Cover image */}
        <Section title="Image de couverture" icon={Image}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">URL de l'image</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
            />
            {coverImage && (
              <button
                onClick={() => setCoverImage("")}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Supprimer l'image
              </button>
            )}
          </div>
        </Section>

        {/* Basic info */}
        <Section title="Informations" icon={Info}>
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Nom de la salle *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={3}
              maxLength={50}
              placeholder="Nom de la salle"
              className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
            />
            <p className="text-xs text-text-tertiary text-right">{name.length}/50</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Décrivez votre salle…"
              className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-colors resize-none"
            />
            <p className="text-xs text-text-tertiary text-right">{description.length}/200</p>
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Visibilité</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PUBLIC", "PRIVATE", "INVITE_ONLY"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "py-2 px-2 rounded-xl text-xs font-medium border transition-all",
                    visibility === v
                      ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
                      : "bg-bg-primary border-bg-tertiary text-text-secondary"
                  )}
                >
                  {v === "PUBLIC" ? "🌍 Pub." : v === "PRIVATE" ? "🔒 Privée" : "✉️ Invite"}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Apparence" icon={Palette}>
          {/* Badge */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Badge emoji</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_BADGES.map((b) => (
                <button
                  key={b}
                  onClick={() => setBadge(b === badge ? "" : b)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all",
                    badge === b
                      ? "border-accent-cyan bg-accent-cyan/10 scale-110"
                      : "border-bg-tertiary bg-bg-primary hover:border-bg-tertiary/80"
                  )}
                >
                  {b}
                </button>
              ))}
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value.slice(0, 4))}
                placeholder="✏️"
                className="w-9 h-9 text-center rounded-lg bg-bg-primary border border-bg-tertiary text-base focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Couleur accent</label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    color === c ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ background: c }}
                />
              ))}
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs text-text-tertiary font-mono">{color}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Members */}
        <Section title={`Membres (${humanMembers.length + agentMembers.length})`} icon={Users}>
          {/* Human members */}
          {humanMembers.length > 0 && (
            <div className="divide-y divide-bg-tertiary">
              {humanMembers.map((m) => (
                <MemberRow
                  key={m.userId}
                  member={m}
                  isMe={m.userId === currentUserId}
                  isOwner={isOwner}
                  onKick={() => kickMutation.mutate({ roomId, targetUserId: m.userId })}
                />
              ))}
            </div>
          )}

          {/* Agent members */}
          {agentMembers.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Agents IA</p>
              <div className="divide-y divide-bg-tertiary">
                {agentMembers.slice(0, 4).map((m) => (
                  <MemberRow key={m.userId} member={m} isMe={false} isOwner={false} onKick={() => {}} />
                ))}
              </div>
              {agentMembers.length > 4 && (
                <p className="text-xs text-text-tertiary mt-2 text-center">
                  + {agentMembers.length - 4} autres agents
                </p>
              )}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}
