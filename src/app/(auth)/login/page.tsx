"use client"

import { Suspense } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { Checkbox } from "~/components/ui/Checkbox"
import { cn } from "~/lib/utils"

const loginSchema = z.object({
  identifier: z.string().min(1, "Email, téléphone ou nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const error = searchParams.get("error")

  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(
    error === "CredentialsSignin" ? "Identifiants invalides" : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)

    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setAuthError(result.error)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

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
          <p className="text-text-secondary">Connectez-vous à votre compte</p>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
            <p className="text-sm text-accent-red text-center">{authError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier (email, phone, or username) */}
          <Input
            label="Email, téléphone ou nom d'utilisateur"
            type="text"
            placeholder="vous@exemple.com"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          {/* Password */}
          <Input
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-primary p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={
                  showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            }
            {...register("password")}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <Checkbox
              label="Se souvenir de moi"
              {...register("rememberMe")}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-accent-cyan hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        {/* Magic Link Option */}
        <Link href="/magic-link">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full min-h-[44px]",
              "bg-bg-secondary border-bg-tertiary hover:bg-bg-tertiary"
            )}
          >
            <span className="mr-2">✨</span>
            Connexion par lien magique
          </Button>
        </Link>

        {/* Social Login Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bg-tertiary" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-primary px-2 text-text-tertiary">
              ou continuer avec
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-h-[44px]",
              "bg-bg-secondary border-bg-tertiary hover:bg-bg-tertiary"
            )}
            onClick={() => signIn("google", { callbackUrl })}
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-h-[44px]",
              "bg-bg-secondary border-bg-tertiary hover:bg-bg-tertiary"
            )}
            onClick={() => signIn("apple", { callbackUrl })}
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            Apple
          </Button>
        </div>

        {/* Register Link */}
        <p className="text-center text-text-secondary text-sm">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-accent-cyan hover:underline">
            Créer un compte
          </Link>
        </p>

        {/* Disclaimer */}
        <p className="text-center text-text-tertiary text-xs px-4">
          En vous connectant, vous acceptez nos{" "}
          <Link href="/terms" className="text-accent-cyan hover:underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="text-accent-cyan hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
