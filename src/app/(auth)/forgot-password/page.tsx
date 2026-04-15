"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const requestResetMutation = api.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: () => {
      // Always show success to prevent enumeration
      setSubmitted(true)
    },
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    await requestResetMutation.mutateAsync({
      identifier: data.identifier,
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-cyan/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Vérifiez vos messages
          </h1>
          <p className="text-text-secondary">
            Si un compte existe avec cette adresse, vous recevrez un lien de
            réinitialisation valide pendant 1 heure.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/login">
            <h1
              className="font-display text-3xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-logo)" }}
            >
              BetAnalytic
            </h1>
          </Link>
          <p className="text-text-secondary">Réinitialiser votre mot de passe</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email ou téléphone"
            type="text"
            placeholder="vous@exemple.com ou +33 6 12 34 56 78"
            autoComplete="email"
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          <p className="text-sm text-text-tertiary">
            Entrez l&apos;email ou le numéro de téléphone associé à votre compte.
            Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || requestResetMutation.isPending}
          >
            {requestResetMutation.isPending
              ? "Envoi en cours..."
              : "Envoyer le lien"}
          </Button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-text-secondary text-sm">
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center gap-2",
              "text-accent-cyan hover:underline"
            )}
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  )
}
