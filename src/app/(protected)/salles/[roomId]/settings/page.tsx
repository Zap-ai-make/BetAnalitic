"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import {
  ArrowLeft, Save, Trash2, Crown, Shield, User,
  Palette, Info, Users, Check, X, AlertTriangle, Camera, Loader2,
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

// Compress image client-side → base64 JPEG (no server needed)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX_W = 900, MAX_H = 300
      const scale = Math.min(MAX_W / img.width, MAX_H / img.height, 1)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("Canvas indisponible"))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.75))
    }
    img.onerror = () => reject(new Error("Impossible de charger l'image"))
    img.src = objectUrl
  })
}

// ── Cover image upload ─────────────────────────────────────────
function CoverUpload({ value, color, badge, onChange }: {
  value: string; color: string; badge: string; onChange: (url: string) => void
}) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Format invalide (image uniquement)"); return }
    if (file.size > 10 * 1024 * 1024) { setError("Image trop grande (max 10 Mo)"); return }
    setError(null)
    setUploading(true)
    try {
      const dataUrl = await compressImage(file)
      onChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      <div
        className="relative w-full rounded-xl overflow-hidden flex items-end cursor-pointer group"
        style={{ height: 120, background: value ? undefined : `linear-gradient(135deg, ${color}50, ${color}15)` }}
        onClick={() => inputRef.current?.click()}
      >
        {value && (
          <img src={value} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        {badge && <span className="absolute top-3 left-3 text-2xl drop-shadow">{badge}</span>}

        {/* Upload overlay */}
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all",
          uploading ? "bg-black/50" : "bg-black/0 group-hover:bg-black/30"
        )}>
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {value ? "Changer l'image" : "Ajouter une image"}
              </span>
            </>
          )}
        </div>

        {/* Accent bar */}
        <div className="relative w-full px-3 pb-2">
          <div className="w-6 h-0.5 rounded-full" style={{ background: color }} />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-tertiary">Appuyez sur l'image pour choisir une photo · Max 3 Mo</p>
        {value && (
          <button onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0">
            Supprimer
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}

// ── Member Row ─────────────────────────────────────────────────
function MemberRow({ member, isMe, isOwner, onKick }: {
  member: {
    userId: string; userName: string; userAvatar: string | null; role: string
    isAgent: boolean; agentEmoji: string | null; agentColor: string | null
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
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium shrink-0">Agent</span>
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
        <p className="text-sm font-medium text-text-primary truncate">
          {member.userName}
          {isMe && <span className="text-text-tertiary text-xs ml-1">(vous)</span>}
        </p>
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

// ── Page ───────────────────────────────────────────────────────
export default function RoomSettingsPage() {
  const params = useParams<{ roomId: string }>()
  const { roomId } = params
  const router = useRouter()
  const { data: session } = useSession()
  const utils = api.useUtils()

  const { data: room, isLoading } = api.room.getById.useQuery({ roomId })
  const { data: members } = api.room.getMembers.useQuery({ roomId })

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [color, setColor] = React.useState("#00D4FF")
  const [badge, setBadge] = React.useState("")
  const [coverImage, setCoverImage] = React.useState("")
  const [visibility, setVisibility] = React.useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PUBLIC")
  const [saved, setSaved] = React.useState(false)

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
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const kickMutation = api.room.kickUser.useMutation({
    onSuccess: () => utils.room.getMembers.invalidate({ roomId }),
  })

  const currentUserId = session?.user?.id ?? ""
  const isOwner = room?.ownerId === currentUserId

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
    </div>
  )

  if (!room || !isOwner) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
      <AlertTriangle className="w-10 h-10 text-text-tertiary/50" />
      <p className="font-semibold text-text-primary">Accès refusé</p>
      <p className="text-sm text-text-tertiary">Seul le créateur peut accéder aux paramètres</p>
      <button onClick={() => router.back()} className="text-sm text-accent-cyan hover:underline mt-2">Retour</button>
    </div>
  )

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
        <button onClick={() => router.back()}
          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-semibold text-text-primary flex-1 text-sm">Paramètres de la salle</h1>
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
          {saved ? <><Check className="w-3.5 h-3.5" />Sauvegardé</> : updateMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />…</> : <><Save className="w-3.5 h-3.5" />Sauvegarder</>}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">

        {/* Cover image */}
        <Section title="Image de couverture" icon={Camera}>
          <CoverUpload value={coverImage} color={color} badge={badge} onChange={setCoverImage} />
        </Section>

        {/* Basic info */}
        <Section title="Informations" icon={Info}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Nom de la salle *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              minLength={3} maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-colors" />
            <p className="text-xs text-text-tertiary text-right">{name.length}/50</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={200} rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-colors resize-none" />
            <p className="text-xs text-text-tertiary text-right">{description.length}/200</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Visibilité</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PUBLIC", "PRIVATE", "INVITE_ONLY"] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={cn("py-2 px-2 rounded-xl text-xs font-medium border transition-all",
                    visibility === v ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan" : "bg-bg-primary border-bg-tertiary text-text-secondary")}>
                  {v === "PUBLIC" ? "🌍 Pub." : v === "PRIVATE" ? "🔒 Privée" : "✉️ Invite"}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Apparence" icon={Palette}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Badge emoji</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_BADGES.map((b) => (
                <button key={b} onClick={() => setBadge(b === badge ? "" : b)}
                  className={cn("w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all",
                    badge === b ? "border-accent-cyan bg-accent-cyan/10 scale-110" : "border-bg-tertiary bg-bg-primary")}>
                  {b}
                </button>
              ))}
              <input type="text" value={badge} onChange={(e) => setBadge(e.target.value.slice(0, 4))}
                placeholder="✏️"
                className="w-9 h-9 text-center rounded-lg bg-bg-primary border border-bg-tertiary text-base focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Couleur accent</label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn("w-7 h-7 rounded-full border-2 transition-all", color === c ? "border-white scale-110" : "border-transparent")}
                  style={{ background: c }} />
              ))}
              <div className="flex items-center gap-2 ml-1">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" />
                <span className="text-xs text-text-tertiary font-mono">{color}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Members */}
        <Section title={`Membres (${humanMembers.length})`} icon={Users}>
          {humanMembers.length > 0 ? (
            <div className="divide-y divide-bg-tertiary">
              {humanMembers.map((m) => (
                <MemberRow key={m.userId} member={m}
                  isMe={m.userId === currentUserId} isOwner={isOwner}
                  onKick={() => kickMutation.mutate({ roomId, targetUserId: m.userId })} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-2">Aucun membre</p>
          )}
        </Section>

        {/* Agent members */}
        <Section title={`Agents IA (${agentMembers.length})`} icon={Users}>
          <div className="divide-y divide-bg-tertiary">
            {agentMembers.slice(0, 5).map((m) => (
              <MemberRow key={m.userId} member={m} isMe={false} isOwner={false} onKick={() => {}} />
            ))}
          </div>
          {agentMembers.length > 5 && (
            <p className="text-xs text-text-tertiary text-center mt-2">+ {agentMembers.length - 5} autres agents</p>
          )}
        </Section>

      </div>
    </div>
  )
}
