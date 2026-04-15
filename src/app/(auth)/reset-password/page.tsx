"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { PasswordStrength } from "~/components/features/auth/PasswordStrength"
import { api } from "~/trpc/react"

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch("password") ?? ""

  // Validate token on mount
  const tokenValidation = api.auth.validateResetToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token }
  )

  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true)
    },
  })

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) return

    await resetPasswordMutation.mutateAsync({
      token,
      newPassword: data.password,
    })
  }

  // No token provided
  if (!token) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-red/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Lien invalide
          </h1>
          <p className="text-text-secondary">
            Le lien de réinitialisation est invalide ou manquant.
          </p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  // Loading token validation
  if (tokenValidation.isLoading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-bg-secondary rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl">🔐</span>
          </div>
          <p className="text-text-secondary">Vérification du lien...</p>
        </div>
      </main>
    )
  }

  // Invalid token
  if (!tokenValidation.data?.valid) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-red/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Lien expiré
          </h1>
          <p className="text-text-secondary">
            {tokenValidation.data?.reason ??
              "Ce lien de réinitialisation n'est plus valide."}
          </p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Mot de passe modifié
          </h1>
          <p className="text-text-secondary">
            Votre mot de passe a été réinitialisé avec succès. Toutes vos
            sessions précédentes ont été déconnectées.
          </p>
          <Link href="/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
        </div>
      </main>
    )
  }

  // Reset form
  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1
            className="font-display text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-logo)" }}
          >
            BetAnalytic
          </h1>
          <p className="text-text-secondary">
            Choisissez un nouveau mot de passe
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-tertiary hover:text-text-primary p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              }
              {...register("password")}
            />
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirmer le nouveau mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Error Display */}
          {resetPasswordMutation.error && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
              <p className="text-sm text-accent-red text-center">
                {resetPasswordMutation.error.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Réinitialisation..."
              : "Réinitialiser le mot de passe"}
          </Button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-text-secondary text-sm">
          <Link href="/login" className="text-accent-cyan hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="text-text-secondary">Chargement...</div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
