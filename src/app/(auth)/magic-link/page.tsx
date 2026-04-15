"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { api } from "~/trpc/react"

const magicLinkSchema = z.object({
  email: z.string().email("Email invalide"),
})

type MagicLinkData = z.infer<typeof magicLinkSchema>

export default function MagicLinkPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkData>({
    resolver: zodResolver(magicLinkSchema),
  })

  const requestMagicLinkMutation = api.auth.requestMagicLink.useMutation({
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const onSubmit = async (data: MagicLinkData) => {
    setSubmittedEmail(data.email)
    await requestMagicLinkMutation.mutateAsync({
      email: data.email,
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-cyan/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Vérifiez votre email
          </h1>
          <p className="text-text-secondary">
            Nous avons envoyé un lien de connexion à{" "}
            <span className="font-medium text-text-primary">{submittedEmail}</span>.
            <br />
            Ce lien expire dans 15 minutes.
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false)
                requestMagicLinkMutation.reset()
              }}
            >
              Renvoyer le lien
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
          <p className="text-xs text-text-tertiary">
            Vérifiez votre dossier spam si vous ne recevez pas l&apos;email.
          </p>
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
          <p className="text-text-secondary">Connexion sans mot de passe</p>
        </div>

        {/* Info */}
        <div className="p-4 bg-bg-secondary rounded-lg">
          <p className="text-sm text-text-secondary">
            Entrez votre email et nous vous enverrons un lien magique pour vous
            connecter instantanément, sans mot de passe.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Error Display */}
          {requestMagicLinkMutation.error && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
              <p className="text-sm text-accent-red text-center">
                {requestMagicLinkMutation.error.message}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || requestMagicLinkMutation.isPending}
          >
            {requestMagicLinkMutation.isPending
              ? "Envoi en cours..."
              : "Envoyer le lien magique"}
          </Button>
        </form>

        {/* Alternative */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bg-tertiary" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-primary px-2 text-text-tertiary">ou</span>
          </div>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            Connexion avec mot de passe
          </Button>
        </Link>

        {/* Register Link */}
        <p className="text-center text-text-secondary text-sm">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-accent-cyan hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  )
}
