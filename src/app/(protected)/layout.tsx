import { auth } from "~/server/auth"
import { redirect } from "next/navigation"
import { RealtimeProvider } from "~/lib/realtime/context"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <RealtimeProvider>{children}</RealtimeProvider>
}
