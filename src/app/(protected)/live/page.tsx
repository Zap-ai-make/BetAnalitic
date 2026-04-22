"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LivePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/matches?filter=live")
  }, [router])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Redirection...</div>
    </div>
  )
}
