"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Crown, Bell, Gift, HelpCircle, Pencil,
  LogOut, ChevronRight, X, Users,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG = {
  FREE:    { label: "FREE",   bg: "bg-accent-cyan/10",  text: "text-accent-cyan",  border: "border-accent-cyan/30",  sub: "Passez à PRO pour plus de signaux" },
  PREMIUM: { label: "PRO",    bg: "bg-amber-400/10",    text: "text-amber-400",    border: "border-amber-400/30",    sub: "Plan PRO actif" },
  EXPERT:  { label: "EXPERT", bg: "bg-purple-400/10",   text: "text-purple-400",   border: "border-purple-400/30",   sub: "Plan Expert actif" },
} as const

type PlanTier = keyof typeof PLAN_CONFIG

// ─── Notification prefs ───────────────────────────────────────────────────────

const NOTIF_KEY = "betanalytic-notif-prefs"

interface NotifPrefs { signals: boolean; rooms: boolean; bets: boolean }

function readNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return { signals: true, rooms: true, bets: true }
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    return raw ? (JSON.parse(raw) as NotifPrefs) : { signals: true, rooms: true, bets: true }
  } catch {
    return { signals: true, rooms: true, bets: true }
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MenuRow = React.memo(function MenuRow({
  icon,
  iconBg,
  label,
  subtitle,
  badge,
  badgeClass,
  onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  subtitle: string
  badge?: string
  badgeClass?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-tertiary/50 transition-colors text-left"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5 leading-tight">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-text-tertiary" />
      </div>
    </button>
  )
})

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors shrink-0",
        checked ? "bg-accent-cyan" : "bg-bg-tertiary"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

function NotifRow({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string
  subtitle: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary">{subtitle}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="px-4 pt-6 pb-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-bg-secondary rounded-lg w-40" />
          <div className="h-3.5 bg-bg-secondary rounded-lg w-24" />
          <div className="h-3 bg-bg-secondary rounded-lg w-32" />
        </div>
      </div>
      <div className="mt-4 h-9 bg-bg-secondary rounded-xl w-40" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Profile data
  const { data: profile, isLoading } = api.profile.getProfile.useQuery(undefined, {
    enabled: !!session?.user?.id,
  })

  // Salles stats for the Communauté card
  const { data: myRooms } = api.room.getMyRooms.useQuery(undefined, {
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  })
  const sallesSubtitle = React.useMemo(() => {
    if (!myRooms) return "Salles créées et rejointes"
    const created = myRooms.filter((r) => r.myRole === "OWNER").length
    const joined  = myRooms.filter((r) => r.myRole !== "OWNER").length
    const members = myRooms.reduce((s, r) => s + (r.memberCount ?? 0), 0)
    const parts: string[] = []
    if (created > 0) parts.push(`${created} créée${created > 1 ? "s" : ""}`)
    if (joined  > 0) parts.push(`${joined} rejointe${joined > 1 ? "s" : ""}`)
    if (members > 0) parts.push(`${members} membre${members > 1 ? "s" : ""}`)
    return parts.length ? parts.join(" · ") : "Aucune salle"
  }, [myRooms])

  // Logout
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      localStorage.clear()
      sessionStorage.clear()
      await signOut({ callbackUrl: "/login", redirect: true })
    } catch {
      setIsLoggingOut(false)
    }
  }

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = React.useState<NotifPrefs>(() => readNotifPrefs())
  const [showNotifSheet, setShowNotifSheet] = React.useState(false)

  const setNotif = (key: keyof NotifPrefs) => (v: boolean) => {
    const next = { ...notifPrefs, [key]: v }
    setNotifPrefs(next)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
  }

  const notifAnyActive = notifPrefs.signals || notifPrefs.rooms || notifPrefs.bets

  // Derived values
  const initials = React.useMemo(() => {
    const name = profile?.displayName ?? session?.user?.name ?? "?"
    return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
  }, [profile?.displayName, session?.user?.name])

  const memberSince = React.useMemo(() => {
    if (!profile?.createdAt) return null
    return new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }, [profile?.createdAt])

  const plan = PLAN_CONFIG[(profile?.subscriptionTier as PlanTier) ?? "FREE"] ?? PLAN_CONFIG.FREE

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-1 pb-28">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="px-4 pt-6 pb-5 border-b border-bg-tertiary">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-2 border-bg-tertiary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center border-2 border-accent-cyan/20">
                    <span className="font-display font-bold text-lg text-bg-primary">{initials}</span>
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="font-display font-bold text-text-primary text-lg leading-tight truncate">
                    {profile?.displayName ?? session?.user?.name ?? "—"}
                  </h1>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0",
                    plan.bg, plan.text, plan.border
                  )}>
                    {plan.label}
                  </span>
                </div>
                <p className="text-sm text-text-tertiary">
                  @{profile?.username ?? session?.user?.email?.split("@")[0] ?? "—"}
                </p>
                {memberSince && (
                  <p className="text-xs text-text-tertiary mt-0.5">Membre depuis {memberSince}</p>
                )}
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier le profil
            </button>
          </div>
        )}

        <div className="px-4 pt-5 space-y-6">

          {/* ── Compte ──────────────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2.5 px-1">
              Compte
            </p>
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary overflow-hidden divide-y divide-bg-tertiary">
              <MenuRow
                icon={<Crown className="h-4 w-4 text-amber-400" />}
                iconBg="bg-amber-400/10"
                label="Abonnement"
                subtitle={plan.sub}
                badge={plan.label}
                badgeClass={cn("border", plan.bg, plan.text, plan.border)}
                onClick={() => router.push("/subscription")}
              />
              <MenuRow
                icon={<Bell className="h-4 w-4 text-accent-cyan" />}
                iconBg="bg-accent-cyan/10"
                label="Notifications"
                subtitle="Signaux, salles et résultats de paris"
                badge={notifAnyActive ? "Actif" : "Désactivé"}
                badgeClass={notifAnyActive
                  ? "text-green-400 bg-green-400/10 border border-green-400/20"
                  : "text-text-tertiary bg-bg-tertiary border border-bg-tertiary"
                }
                onClick={() => setShowNotifSheet(true)}
              />
            </div>
          </section>

          {/* ── Communauté ──────────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2.5 px-1">
              Communauté
            </p>
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary overflow-hidden divide-y divide-bg-tertiary">
              <MenuRow
                icon={<Gift className="h-4 w-4 text-green-400" />}
                iconBg="bg-green-400/10"
                label="Parrainage"
                subtitle="Invitez des amis, gagnez 20% sur leur abonnement"
                onClick={() => router.push("/referral")}
              />
            </div>
          </section>

          {/* ── Salles ──────────────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2.5 px-1">
              Salles
            </p>
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary overflow-hidden">
              {/* Summary row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-tertiary">
                <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm text-text-secondary">{sallesSubtitle}</p>
              </div>

              {/* Per-room list */}
              {myRooms && myRooms.length > 0 ? (
                myRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => router.push(`/salles/${room.id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-tertiary/50 transition-colors border-b border-bg-tertiary last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        room.myRole === "OWNER"
                          ? "bg-accent-cyan/10 text-accent-cyan"
                          : "bg-bg-tertiary text-text-tertiary"
                      )}>
                        {room.myRole === "OWNER" ? "créée" : "rejoint"}
                      </span>
                      <p className="text-sm font-medium text-text-primary truncate">{room.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Users className="h-3 w-3 text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">{room.memberCount ?? 0}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-text-tertiary text-center">
                  Aucune salle pour l&apos;instant
                </div>
              )}
            </div>
          </section>

          {/* ── Aide ────────────────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2.5 px-1">
              Aide
            </p>
            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary overflow-hidden">
              <MenuRow
                icon={<HelpCircle className="h-4 w-4 text-text-secondary" />}
                iconBg="bg-bg-tertiary"
                label="Centre d'aide"
                subtitle="FAQ, tutoriels, nous contacter"
                onClick={() => router.push("/aide")}
              />
            </div>
          </section>

          {/* ── Déconnexion ─────────────────────────────────────────────────── */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40 py-1"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
            </button>
          </div>

          <p className="text-xs text-text-tertiary/50 pb-2">BetAnalytic v0.1.0</p>
        </div>
      </main>

      {/* ── Notifications bottom sheet ──────────────────────────────────────── */}
      {showNotifSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[55] backdrop-blur-sm"
            onClick={() => setShowNotifSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-bg-secondary rounded-t-2xl border-t border-bg-tertiary">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-bg-tertiary rounded-full" />
            </div>

            <div className="px-5 pt-2 pb-24">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-text-primary">Notifications</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">Choisissez ce que vous souhaitez recevoir</p>
                </div>
                <button
                  onClick={() => setShowNotifSheet(false)}
                  className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 divide-y divide-bg-tertiary">
                <NotifRow
                  label="Signaux IA"
                  subtitle="Nouveaux picks disponibles chaque matin"
                  checked={notifPrefs.signals}
                  onChange={setNotif("signals")}
                />
                <NotifRow
                  label="Mes Salles"
                  subtitle="Messages et activité dans vos salles"
                  checked={notifPrefs.rooms}
                  onChange={setNotif("rooms")}
                />
                <NotifRow
                  label="Paris"
                  subtitle="Résultats et gain potentiel de vos coupons"
                  checked={notifPrefs.bets}
                  onChange={setNotif("bets")}
                />
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
