"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

function MagicLinkVerification() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const verifyMagicLinkMutation = api.auth.verifyMagicLink.useMutation({
    onSuccess: async (data) => {
      if (data.success && data.user) {
        // Sign in with next-auth using the verified user
        const result = await signIn("credentials", {
          identifier: data.user.email ?? data.user.username,
          // Use a special flag to indicate magic link verification
          password: `__magic_link__:${token}`,
          redirect: false,
        })

        if (result?.error) {
          // If credential sign-in fails, redirect to login
          // This happens because we need a special auth flow for magic links
          setStatus("success")
          // Redirect after showing success
          setTimeout(() => {
            router.replace("/login?verified=true")
          }, 2000)
        } else {
          setStatus("success")
          // Redirect to dashboard
          setTimeout(() => {
            router.replace("/dashboard")
          }, 1500)
        }
      }
    },
    onError: (error) => {
      setStatus("error")
      setErrorMessage(error.message)
    },
  })

  useEffect(() => {
    if (token && status === "loading") {
      verifyMagicLinkMutation.mutate({ token })
    }
  }, [token, status, verifyMagicLinkMutation])

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
            Le lien de connexion est invalide ou manquant.
          </p>
          <Link href="/magic-link">
            <Button variant="outline" className="w-full">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  // Loading
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-cyan/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Vérification en cours...
          </h1>
          <p className="text-text-secondary">
            Veuillez patienter pendant que nous vous connectons.
          </p>
        </div>
      </main>
    )
  }

  // Error
  if (status === "error") {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent-red/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Lien expiré ou invalide
          </h1>
          <p className="text-text-secondary">
            {errorMessage || "Ce lien n'est plus valide."}
          </p>
          <div className="space-y-3">
            <Link href="/magic-link">
              <Button className="w-full">Demander un nouveau lien</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Connexion avec mot de passe
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Success
  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Connexion réussie !
        </h1>
        <p className="text-text-secondary">
          Vous allez être redirigé vers votre tableau de bord...
        </p>
      </div>
    </main>
  )
}

export default function MagicLinkVerificationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="text-text-secondary">Chargement...</div>
        </main>
      }
    >
      <MagicLinkVerification />
    </Suspense>
  )
}
