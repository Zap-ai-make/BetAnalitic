"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Lock } from "lucide-react"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et underscores uniquement"),
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

function resizeImage(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!ALLOWED.includes(file.type)) {
      reject(new Error("Type non autorisé. Utilisez JPG, PNG, WebP ou GIF."))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Fichier trop volumineux. Maximum 5 MB."))
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Impossible de lire l'image")) }
    img.src = url
  })
}

const SPORTS = [
  { id: "football",   label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis",     label: "Tennis" },
  { id: "rugby",      label: "Rugby" },
  { id: "hockey",     label: "Hockey" },
  { id: "baseball",   label: "Baseball" },
  { id: "mma",        label: "MMA" },
  { id: "boxing",     label: "Boxe" },
  { id: "esports",    label: "Esports" },
]

const EXPERTISE_LEVELS = [
  { value: "BEGINNER",     label: "Débutant",       description: "Nouveau dans les paris sportifs" },
  { value: "INTERMEDIATE", label: "Intermédiaire",   description: "Quelques mois d'expérience" },
  { value: "EXPERT",       label: "Expert",          description: "Parieur expérimenté" },
] as const

const ANALYSIS_DEPTHS = [
  { value: "QUICK",    label: "Rapide",    description: "Analyses concises" },
  { value: "STANDARD", label: "Standard",  description: "Analyses équilibrées" },
  { value: "DETAILED", label: "Détaillée", description: "Analyses approfondies" },
] as const

export default function EditProfilePage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const utils = api.useUtils()
  const { data: profile, isLoading: profileLoading } = api.profile.getProfile.useQuery()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    values: profile
      ? {
          displayName: profile.displayName ?? profile.username ?? "",
          username: profile.username,
          bio: profile.bio ?? "",
        }
      : undefined,
  })

  // Preferences state — display only, section is locked
  const [expertiseLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">(
    profile?.expertiseLevel ?? "BEGINNER"
  )
  const [analysisDepth] = useState<"QUICK" | "STANDARD" | "DETAILED">(
    profile?.analysisDepth ?? "STANDARD"
  )
  const [selectedSports] = useState<string[]>(["football"])

  useEffect(() => {
    // no-op: preferences are display-only
  }, [profile?.id])

  const updateProfileMutation = api.profile.updateProfile.useMutation({
    onSuccess: async () => {
      setSuccessMessage("Profil mis à jour avec succès!")
      setTimeout(() => setSuccessMessage(null), 3000)
      await utils.profile.getProfile.invalidate()
    },
  })

  const onSubmitProfile = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync({
      displayName: data.displayName,
      username: data.username,
      bio: data.bio ?? undefined,
    })
  }

  const updateAvatarMutation = api.profile.updateAvatar.useMutation({
    onSuccess: async () => {
      setSuccessMessage("Photo mise à jour!")
      setTimeout(() => setSuccessMessage(null), 3000)
      await utils.profile.getProfile.invalidate()
    },
    onError: (err) => {
      setUploadError(err.message)
      setAvatarPreview(null)
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    try {
      // Resize to max 256×256 via canvas → keeps base64 payload small
      const dataUrl = await resizeImage(file, 256)
      setAvatarPreview(dataUrl)
      await updateAvatarMutation.mutateAsync({ dataUrl })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erreur lors du téléchargement")
      setAvatarPreview(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  const contactLabel = profile?.email
    ? profile.email
    : profile?.phone ?? ""

  const initials = (profile?.displayName ?? profile?.username ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/profile" className="text-text-secondary hover:text-text-primary text-sm">
            Annuler
          </Link>
          <h1 className="font-display font-bold text-text-primary">Modifier le profil</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-green-400/10 border border-green-400/20 rounded-xl">
          <p className="text-sm text-green-400 text-center">{successMessage}</p>
        </div>
      )}

      <main className="p-4 space-y-6 pb-12">

        {/* ── Photo ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden border-2 border-bg-tertiary">
              {isUploading ? (
                <div className="animate-pulse text-text-tertiary text-xs">...</div>
              ) : avatarPreview ?? profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview ?? profile?.avatarUrl ?? ""}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-bg-primary">{initials}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary shadow-lg disabled:opacity-50 hover:bg-accent-cyan/80 transition-colors"
            >
              <span className="text-sm font-bold">+</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-sm text-accent-cyan hover:underline disabled:opacity-50"
          >
            {isUploading ? "Téléchargement..." : "Changer la photo"}
          </button>
          {uploadError && (
            <p className="text-sm text-red-400 text-center px-4">{uploadError}</p>
          )}
        </div>

        {/* ── Informations ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-4">
            <h2 className="font-display font-semibold text-text-primary">Informations</h2>

            <Input
              label="Nom d'affichage"
              placeholder="Votre nom"
              error={errors.displayName?.message}
              {...register("displayName")}
            />

            <Input
              label="Nom d'utilisateur"
              placeholder="username"
              hint="Lettres, chiffres et underscores uniquement"
              error={errors.username?.message}
              {...register("username")}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Bio</label>
              <textarea
                placeholder="Parlez-nous de vous..."
                className={cn(
                  "w-full h-24 rounded-xl border bg-bg-primary px-4 py-3",
                  "text-sm text-text-primary placeholder:text-text-tertiary",
                  "transition-colors resize-none",
                  "focus:outline-none focus:border-accent-cyan",
                  errors.bio ? "border-red-400" : "border-bg-tertiary hover:border-bg-tertiary/80"
                )}
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-400">{errors.bio.message}</p>
              )}
            </div>

            {/* Email / phone — readonly, from registration */}
            <Input
              label={profile?.email ? "Email" : "Téléphone"}
              value={contactLabel}
              disabled
              hint="Non modifiable"
            />
          </div>

          {updateProfileMutation.error && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{updateProfileMutation.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>

        {/* ── Préférences (verrouillées) ──────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold text-text-primary">Préférences</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full border border-bg-tertiary">
              <Lock className="h-2.5 w-2.5" />
              Bientôt disponible
            </span>
          </div>

          {/* Greyed-out preferences — not interactive */}
          <div className="pointer-events-none opacity-40 select-none space-y-4">

            {/* Expertise */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Niveau d&apos;expertise
              </label>
              <div className="space-y-2">
                {EXPERTISE_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className={cn(
                      "w-full p-3 rounded-xl border-2 text-left",
                      expertiseLevel === level.value
                        ? "border-accent-cyan bg-accent-cyan/10"
                        : "border-transparent bg-bg-primary"
                    )}
                  >
                    <div className="font-medium text-sm text-text-primary">{level.label}</div>
                    <div className="text-xs text-text-secondary">{level.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis depth */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Profondeur d&apos;analyse
              </label>
              <div className="space-y-2">
                {ANALYSIS_DEPTHS.map((depth) => (
                  <div
                    key={depth.value}
                    className={cn(
                      "w-full p-3 rounded-xl border-2 text-left",
                      analysisDepth === depth.value
                        ? "border-accent-cyan bg-accent-cyan/10"
                        : "border-transparent bg-bg-primary"
                    )}
                  >
                    <div className="font-medium text-sm text-text-primary">{depth.label}</div>
                    <div className="text-xs text-text-secondary">{depth.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sports favoris */}
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Sports favoris
              </label>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((sport) => (
                  <div
                    key={sport.id}
                    className={cn(
                      "px-3 py-2 rounded-xl border-2 text-sm font-medium",
                      selectedSports.includes(sport.id)
                        ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                        : "border-transparent bg-bg-primary text-text-secondary"
                    )}
                  >
                    {sport.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
