import { auth } from "~/server/auth"
import { redirect } from "next/navigation"
import { LangProvider } from "~/lib/lang"
import { InstallBanner } from "~/components/shared/InstallBanner"
import { AppShell } from "~/components/shared/AppShell"
import { ScrollReset } from "~/components/shared/ScrollReset"

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
    <LangProvider>
      {/* AppShell renders Header + DashboardNav once — they persist across tab navigations */}
      <AppShell />
      {/* Spacer that pushes content below the fixed header, accounting for safe-area-inset-top */}
      <div aria-hidden style={{ height: "var(--header-h)" }} />
      {/* Scroll container scoped to viewport minus header — prevents body scroll in PWA */}
      <div id="main-scroll" style={{ height: "calc(100dvh - var(--header-h))", overflowY: "auto", overscrollBehavior: "none" }}>
        <ScrollReset />
        {children}
      </div>
      <InstallBanner />
    </LangProvider>
  )
}
