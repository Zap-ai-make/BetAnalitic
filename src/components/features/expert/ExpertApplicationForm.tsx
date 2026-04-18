"use client"

/**
 * Epic 10 Story 10.1: Expert Application Form
 * Allow users to apply to become verified experts
 */

import * as React from "react"
import { Crown, Sparkles, AlertCircle, Check, X, Plus } from "lucide-react"
import { cn } from "~/lib/utils"

interface ExpertApplicationFormProps {
  onSubmit: (data: ExpertApplicationData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export interface ExpertApplicationData {
  bio: string
  expertiseAreas: string[]
  socialProofLinks: string[]
  trackRecord: string
  certifications?: string
  mediaAppearances?: string
}

export function ExpertApplicationForm({
  onSubmit,
  onCancel,
  className,
}: ExpertApplicationFormProps) {
  const [bio, setBio] = React.useState("")
  const [expertise, setExpertise] = React.useState<string[]>([])
  const [newExpertise, setNewExpertise] = React.useState("")
  const [socialLinks, setSocialLinks] = React.useState<string[]>([""])
  const [trackRecord, setTrackRecord] = React.useState("")
  const [certifications, setCertifications] = React.useState("")
  const [mediaAppearances, setMediaAppearances] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()])
      setNewExpertise("")
    }
  }

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item))
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, ""])
  }

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks]
    updated[index] = value
    setSocialLinks(updated)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!bio.trim()) {
      setError("La bio est requise")
      return
    }
    if (expertise.length === 0) {
      setError("Ajoutez au moins un domaine d'expertise")
      return
    }
    if (socialLinks.filter((l) => l.trim()).length === 0) {
      setError("Ajoutez au moins un lien de preuve sociale")
      return
    }
    if (!trackRecord.trim()) {
      setError("Le track record est requis")
      return
    }

    const data: ExpertApplicationData = {
      bio: bio.trim(),
      expertiseAreas: expertise,
      socialProofLinks: socialLinks.filter((l) => l.trim()),
      trackRecord: trackRecord.trim(),
      certifications: certifications.trim() || undefined,
      mediaAppearances: mediaAppearances.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    bio.trim() &&
    expertise.length > 0 &&
    socialLinks.some((l) => l.trim()) &&
    trackRecord.trim()

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Bio <span className="text-accent-red">*</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Présentez-vous en quelques mots : votre expérience, votre approche analytique..."
          rows={4}
          maxLength={500}
          className={cn(
            "w-full px-4 py-3 bg-bg-tertiary rounded-xl border border-bg-tertiary",
            "text-text-primary placeholder:text-text-tertiary resize-none",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          )}
        />
        <p className="text-xs text-text-tertiary mt-1">{bio.length}/500 caractères</p>
      </div>

      {/* Expertise Areas */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Domaines d&apos;expertise <span className="text-accent-red">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
            placeholder="Ex: Ligue 1, xG Analysis, Corners..."
            className={cn(
              "flex-1 px-4 py-2 bg-bg-tertiary rounded-lg border border-bg-tertiary",
              "text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
            )}
          />
          <button
            type="button"
            onClick={addExpertise}
            className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold hover:bg-accent-cyan/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {expertise.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {expertise.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full"
              >
                <span className="text-sm font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => removeExpertise(item)}
                  className="hover:text-accent-red transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Proof Links */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Liens de preuve sociale <span className="text-accent-red">*</span>
        </label>
        <p className="text-xs text-text-tertiary mb-3">
          LinkedIn, Twitter, blog, chaîne YouTube, portfolio, etc.
        </p>
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateSocialLink(index, e.target.value)}
                placeholder="https://..."
                className={cn(
                  "flex-1 px-4 py-2 bg-bg-tertiary rounded-lg border border-bg-tertiary",
                  "text-text-primary placeholder:text-text-tertiary",
                  "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                )}
              />
              {socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSocialLink}
          className="mt-2 text-sm text-accent-cyan hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Ajouter un lien
        </button>
      </div>

      {/* Track Record */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Track Record <span className="text-accent-red">*</span>
        </label>
        <textarea
          value={trackRecord}
          onChange={(e) => setTrackRecord(e.target.value)}
          placeholder="Décrivez vos succès passés : précision de prédictions, gains documentés, insights validés..."
          rows={5}
          maxLength={1000}
          className={cn(
            "w-full px-4 py-3 bg-bg-tertiary rounded-xl border border-bg-tertiary",
            "text-text-primary placeholder:text-text-tertiary resize-none",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          )}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {trackRecord.length}/1000 caractères
        </p>
      </div>

      {/* Certifications (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Certifications <span className="text-text-tertiary">(Optionnel)</span>
        </label>
        <input
          type="text"
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          placeholder="Ex: ACCA Level 2, Analyst certifications..."
          className={cn(
            "w-full px-4 py-2 bg-bg-tertiary rounded-lg border border-bg-tertiary",
            "text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          )}
        />
      </div>

      {/* Media Appearances (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Apparitions médias <span className="text-text-tertiary">(Optionnel)</span>
        </label>
        <textarea
          value={mediaAppearances}
          onChange={(e) => setMediaAppearances(e.target.value)}
          placeholder="Articles, interviews, podcasts, TV..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 bg-bg-tertiary rounded-xl border border-bg-tertiary",
            "text-text-primary placeholder:text-text-tertiary resize-none",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          )}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
          <p className="text-sm text-accent-red">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl bg-bg-tertiary text-text-primary font-semibold hover:bg-bg-tertiary/70 transition-colors min-h-[44px]"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={cn(
            "flex-1 px-6 py-3 rounded-xl font-semibold transition-all min-h-[44px]",
            isFormValid && !isSubmitting
              ? "bg-gradient-to-r from-accent-gold to-accent-orange text-bg-primary hover:shadow-lg"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Envoi en cours..." : "Soumettre la candidature"}
        </button>
      </div>
    </form>
  )
}

/**
 * Application Submitted Success State
 */
interface ApplicationSubmittedProps {
  className?: string
}

export function ApplicationSubmitted({ className }: ApplicationSubmittedProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
        <Check className="w-10 h-10 text-accent-green" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <Crown className="w-6 h-6 text-accent-gold animate-pulse" />
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Candidature envoyée !
        </h2>
      </div>

      <p className="text-text-secondary max-w-md mx-auto mb-6">
        Votre candidature est <strong>en cours de révision</strong>. Notre équipe
        l&apos;examinera dans les <strong>48-72 heures</strong>.
      </p>

      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 rounded-xl p-6 max-w-md mx-auto border border-accent-cyan/30">
        <p className="text-sm font-semibold text-text-primary mb-3">
          Prochaines étapes :
        </p>
        <ul className="space-y-2 text-sm text-text-secondary text-left">
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <span>Vérification de vos références et track record</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <span>Notification par email du résultat</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <span>Si approuvé : onboarding et activation du badge Expert</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
