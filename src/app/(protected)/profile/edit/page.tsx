"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
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
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Lettres, chiffres et underscores uniquement"
    ),
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

const EXPERTISE_LEVELS = [
  { value: "BEGINNER", label: "Débutant", description: "Nouveau dans les paris sportifs" },
  { value: "INTERMEDIATE", label: "Intermédiaire", description: "Quelques mois d'expérience" },
  { value: "EXPERT", label: "Expert", description: "Parieur expérimenté" },
] as const

const ANALYSIS_DEPTHS = [
  { value: "QUICK", label: "Rapide", description: "Analyses concises" },
  { value: "STANDARD", label: "Standard", description: "Analyses équilibrées" },
  { value: "DETAILED", label: "Détaillée", description: "Analyses approfondies" },
] as const

const SPORTS = [
  { id: "football", label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
  { id: "rugby", label: "Rugby" },
  { id: "hockey", label: "Hockey" },
  { id: "baseball", label: "Baseball" },
  { id: "mma", label: "MMA" },
  { id: "boxing", label: "Boxe" },
  { id: "esports", label: "Esports" },
]

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
          displayName: profile.displayName ?? "",
          username: profile.username,
          bio: profile.bio ?? "",
        }
      : undefined,
  })

  // Preferences state
  const [expertiseLevel, setExpertiseLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">(
    profile?.expertiseLevel ?? "BEGINNER"
  )
  const [analysisDepth, setAnalysisDepth] = useState<"QUICK" | "STANDARD" | "DETAILED">(
    profile?.analysisDepth ?? "STANDARD"
  )
  const [selectedSports, setSelectedSports] = useState<string[]>(profile?.favoriteSports ?? [])

  // Update state when profile loads
  if (profile && expertiseLevel !== profile.expertiseLevel && profile.expertiseLevel) {
    setExpertiseLevel(profile.expertiseLevel)
  }
  if (profile && analysisDepth !== profile.analysisDepth && profile.analysisDepth) {
    setAnalysisDepth(profile.analysisDepth)
  }
  if (profile && JSON.stringify(selectedSports) !== JSON.stringify(profile.favoriteSports)) {
    setSelectedSports(profile.favoriteSports)
  }

  const updateProfileMutation = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      setSuccessMessage("Profil mis à jour avec succès!")
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  const updatePreferencesMutation = api.profile.updatePreferences.useMutation({
    onSuccess: () => {
      setSuccessMessage("Préférences mises à jour avec succès!")
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  const onSubmitProfile = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync({
      displayName: data.displayName,
      username: data.username,
      bio: data.bio ?? undefined,
    })
  }

  const onSavePreferences = async () => {
    await updatePreferencesMutation.mutateAsync({
      expertiseLevel,
      analysisDepth,
      favoriteSports: selectedSports,
    })
  }

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : prev.length < 5
          ? [...prev, sportId]
          : prev
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as { error?: string; avatarUrl?: string }

      if (!response.ok) {
        throw new Error(data.error ?? "Erreur lors du téléchargement")
      }

      setSuccessMessage("Photo mise à jour!")
      setTimeout(() => setSuccessMessage(null), 3000)
      await utils.profile.getProfile.invalidate()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erreur lors du téléchargement")
      setAvatarPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/profile" className="text-text-secondary hover:text-text-primary">
            Annuler
          </Link>
          <h1 className="font-display font-bold text-text-primary">Modifier le profil</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
          <p className="text-sm text-accent-green text-center">{successMessage}</p>
        </div>
      )}

      <main className="p-4 space-y-6 pb-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
              {isUploading ? (
                <div className="animate-pulse text-text-secondary">...</div>
              ) : avatarPreview ?? profile?.avatarUrl ? (
                <img
                  src={avatarPreview ?? profile?.avatarUrl ?? ""}
                  alt={profile?.displayName ?? "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-3xl font-bold text-text-primary">
                  {(profile?.displayName ?? profile?.username ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50"
            >
              <span className="text-sm">+</span>
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
            <p className="text-sm text-accent-red">{uploadError}</p>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="bg-bg-secondary rounded-xl p-4 space-y-4">
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
                  "w-full h-24 rounded-lg border-2 bg-bg-primary px-4 py-3",
                  "text-base text-text-primary placeholder:text-text-tertiary",
                  "transition-colors duration-200 resize-none",
                  "focus:outline-none focus:border-accent-cyan",
                  errors.bio
                    ? "border-accent-red"
                    : "border-transparent hover:border-bg-tertiary"
                )}
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-accent-red">{errors.bio.message}</p>
              )}
            </div>

            <Input
              label="Email"
              type="email"
              value={profile?.email ?? ""}
              disabled
              hint="L'email ne peut pas être modifié"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer le profil"}
          </Button>
        </form>

        {/* Error Display */}
        {updateProfileMutation.error && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
            <p className="text-sm text-accent-red text-center">
              {updateProfileMutation.error.message}
            </p>
          </div>
        )}

        {/* Preferences Section */}
        <div className="bg-bg-secondary rounded-xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-text-primary">Préférences</h2>

          {/* Expertise Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Niveau d&apos;expertise
            </label>
            <div className="space-y-2">
              {EXPERTISE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setExpertiseLevel(level.value)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-colors",
                    expertiseLevel === level.value
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-transparent bg-bg-primary hover:border-bg-tertiary"
                  )}
                >
                  <div className="font-medium text-text-primary">{level.label}</div>
                  <div className="text-sm text-text-secondary">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Depth */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Profondeur d&apos;analyse
            </label>
            <div className="space-y-2">
              {ANALYSIS_DEPTHS.map((depth) => (
                <button
                  key={depth.value}
                  type="button"
                  onClick={() => setAnalysisDepth(depth.value)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-colors",
                    analysisDepth === depth.value
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-transparent bg-bg-primary hover:border-bg-tertiary"
                  )}
                >
                  <div className="font-medium text-text-primary">{depth.label}</div>
                  <div className="text-sm text-text-secondary">{depth.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Sports */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Sports favoris (max 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => toggleSport(sport.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                    selectedSports.includes(sport.id)
                      ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                      : "border-transparent bg-bg-primary text-text-secondary hover:border-bg-tertiary"
                  )}
                >
                  {sport.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={onSavePreferences}
          className="w-full"
          disabled={updatePreferencesMutation.isPending}
        >
          {updatePreferencesMutation.isPending
            ? "Enregistrement..."
            : "Enregistrer les préférences"}
        </Button>

        {updatePreferencesMutation.error && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
            <p className="text-sm text-accent-red text-center">
              {updatePreferencesMutation.error.message}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
