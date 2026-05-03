import { auth } from "~/server/auth"
import { redirect } from "next/navigation"
import { RealtimeProvider } from "~/lib/realtime/context"
import { LangProvider } from "~/lib/lang"
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
      <LangProvider>
        {/* Spacer that pushes content below the fixed header, accounting for safe-area-inset-top */}
        <div aria-hidden style={{ height: "var(--header-h)" }} />
        {/* Scroll container scoped to viewport minus header — prevents body scroll in PWA */}
        <div style={{ height: "calc(100dvh - var(--header-h))", overflowY: "auto" }}>
          {children}
        </div>
        <InstallBanner />
      </LangProvider>
    </RealtimeProvider>
  )
}
