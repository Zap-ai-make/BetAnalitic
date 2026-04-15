"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const login = useCallback(
    async (identifier: string, password: string) => {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.refresh()
      return result
    },
    [router]
  )

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }, [router])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    session,
  }
}
