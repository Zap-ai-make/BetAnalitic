import { auth } from "~/server/auth"
import { redirect } from "next/navigation"
import { RealtimeProvider } from "~/lib/realtime/context"
import { InstallBanner } from "~/components/shared/InstallBanner"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <RealtimeProvider>
      {/* Spacer that pushes content below the fixed header, accounting for safe-area-inset-top */}
      <div aria-hidden style={{ height: "var(--header-h)" }} />
      {children}
      <InstallBanner />
    </RealtimeProvider>
  )
}
