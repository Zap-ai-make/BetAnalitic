"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/Input"
import { Checkbox } from "~/components/ui/Checkbox"
import { PasswordStrength } from "~/components/features/auth/PasswordStrength"
import {
  registerFormSchema,
  type RegisterFormData,
} from "~/lib/validations/auth"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [registrationType, setRegistrationType] = useState<"email" | "phone">(
    "email"
  )
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      registrationType: "email",
      ageVerified: false,
    },
  })

  const password = watch("password") ?? ""

  // Check for referral code in localStorage (Story 11.2)
  useEffect(() => {
    const storedReferralCode = localStorage.getItem("referralCode")
    if (storedReferralCode) {
      setReferralCode(storedReferralCode)
    }
  }, [])

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      localStorage.removeItem("referralCode")
      router.push("/login?registered=1")
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    await registerMutation.mutateAsync({
      email: data.registrationType === "email" ? data.email : undefined,
      phone: data.registrationType === "phone" ? data.phone : undefined,
      username: data.username,
      password: data.password,
      ageVerified: true,
      referralCode: referralCode ?? undefined,
    })
  }

  const handleTypeChange = (type: "email" | "phone") => {
    setRegistrationType(type)
    setValue("registrationType", type)
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
          <p className="text-text-secondary">Créez votre compte</p>
        </div>

        {/* Registration Type Toggle */}
        <div className="flex bg-bg-secondary rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleTypeChange("email")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-sm font-medium transition-all",
              "min-h-[44px]",
              registrationType === "email"
                ? "bg-accent-cyan text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("phone")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-sm font-medium transition-all",
              "min-h-[44px]",
              registrationType === "phone"
                ? "bg-accent-cyan text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Téléphone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email or Phone */}
          {registrationType === "email" ? (
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register("email")}
            />
          ) : (
            <Input
              label="Téléphone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              error={errors.phone?.message}
              {...register("phone")}
            />
          )}

          {/* Username */}
          <Input
            label="Nom d'utilisateur"
            placeholder="votre_pseudo"
            error={errors.username?.message}
            {...register("username")}
          />

          {/* Password */}
          <div className="space-y-2">
            <Input
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-tertiary hover:text-text-primary p-1"
                  aria-label={
                    showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
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
            label="Confirmer le mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Age Verification */}
          <Checkbox
            label={
              <>
                Je confirme avoir <strong>18 ans ou plus</strong> et j&apos;accepte
                les{" "}
                <Link href="/terms" className="text-accent-cyan hover:underline">
                  conditions d&apos;utilisation
                </Link>
              </>
            }
            error={errors.ageVerified?.message}
            {...register("ageVerified")}
          />

          {/* Submit Error */}
          {registerMutation.error && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
              <p className="text-sm text-accent-red">
                {registerMutation.error.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || registerMutation.isPending}
          >
            {registerMutation.isPending ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-text-secondary text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Se connecter
          </Link>
        </p>

        {/* Disclaimer */}
        <p className="text-center text-text-tertiary text-xs px-4">
          ⚠️ BetAnalytic est un outil d&apos;analyse. Nous ne fournissons pas de
          conseils de paris. Jouez de manière responsable.
        </p>
      </div>
    </main>
  )
}
