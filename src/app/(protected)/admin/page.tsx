/**
 * Admin Dashboard (Story 14.1)
 * Platform overview with key metrics and system health
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Users,
  UserPlus,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Check admin access
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-bg-tertiary border-t-accent-cyan"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return <AdminDashboardContent timeRange={timeRange} setTimeRange={setTimeRange} />;
}

function AdminDashboardContent({
  timeRange,
  setTimeRange,
}: {
  timeRange: "7d" | "30d" | "90d";
  setTimeRange: (range: "7d" | "30d" | "90d") => void;
}) {
  const { data: metrics, isLoading: metricsLoading } = api.admin.getMetrics.useQuery({
    timeRange,
  });

  const { data: health, isLoading: healthLoading } = api.admin.getSystemHealth.useQuery();

  if (metricsLoading || healthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-bg-tertiary border-t-accent-cyan"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-accent-cyan" />
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        </div>
        <p className="mt-2 text-text-secondary">
          Aperçu de la plateforme et métriques clés
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              timeRange === range
                ? "bg-accent-cyan text-bg-primary"
                : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
            }`}
          >
            {range === "7d" ? "7 jours" : range === "30d" ? "30 jours" : "90 jours"}
          </button>
        ))}
      </div>

      {/* System Health Alert */}
      {health && health.errors.status !== "healthy" && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg border-l-4 p-4 ${
            health.errors.status === "critical"
              ? "border-accent-red bg-accent-red/10"
              : "border-accent-orange bg-accent-orange/10"
          }`}
        >
          <AlertCircle className="h-6 w-6 text-accent-red" />
          <div>
            <p className="font-semibold text-text-primary">
              {health.errors.status === "critical" ? "Alerte Critique" : "Avertissement"}
            </p>
            <p className="text-sm text-text-secondary">
              {health.errors.lastHour} erreurs dans la dernière heure
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <MetricCard
          icon={Users}
          title="Utilisateurs Actifs"
          value={metrics?.activeUsers.daily ?? 0}
          subtitle={`${metrics?.activeUsers.weekly ?? 0} cette semaine`}
          trend="+12%"
          color="cyan"
        />

        {/* New Registrations */}
        <MetricCard
          icon={UserPlus}
          title="Nouvelles Inscriptions"
          value={metrics?.newRegistrations ?? 0}
          subtitle={`${timeRange === "7d" ? "7 jours" : timeRange === "30d" ? "30 jours" : "90 jours"}`}
          trend="+8%"
          color="green"
        />

        {/* Revenue */}
        <MetricCard
          icon={DollarSign}
          title="Revenus"
          value={`€${metrics?.revenue.total.toFixed(2) ?? "0.00"}`}
          subtitle={`${metrics?.users.premium ?? 0} utilisateurs premium`}
          trend="+15%"
          color="yellow"
        />

        {/* Moderation */}
        <MetricCard
          icon={AlertCircle}
          title="Modération"
          value={metrics?.moderation.pendingReports ?? 0}
          subtitle="Signalements en attente"
          trend="0"
          color="red"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Total Users */}
        <div className="rounded-xl bg-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Utilisateurs</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {metrics?.users.total ?? 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-accent-cyan" />
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <p className="text-text-tertiary">Free</p>
              <p className="font-semibold text-text-primary">{metrics?.users.free ?? 0}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Premium</p>
              <p className="font-semibold text-text-primary">
                {metrics?.users.premium ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Expert Applications */}
        <div className="rounded-xl bg-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Candidatures Expert
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {metrics?.moderation.pendingExpertApplications ?? 0}
              </p>
            </div>
            <Shield className="h-8 w-8 text-accent-purple" />
          </div>
          <p className="mt-4 text-sm text-text-tertiary">En attente de révision</p>
        </div>

        {/* System Health */}
        <div className="rounded-xl bg-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Santé Système</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {health?.database === "healthy" ? "OK" : "ERROR"}
              </p>
            </div>
            <Activity className={`h-8 w-8 ${health?.database === "healthy" ? "text-accent-green" : "text-accent-red"}`} />
          </div>
          <p className="mt-4 text-sm text-text-tertiary">
            Uptime: {Math.floor((health?.uptime ?? 0) / 60 / 60)}h
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-text-primary">Actions Rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton href="/admin/users" icon={Users}>
            Gérer Utilisateurs
          </QuickActionButton>
          <QuickActionButton href="/admin/moderation" icon={Shield}>
            File Modération
          </QuickActionButton>
          <QuickActionButton href="/admin/reports" icon={AlertCircle}>
            Signalements
          </QuickActionButton>
          <QuickActionButton href="/admin/config" icon={Activity}>
            Configuration
          </QuickActionButton>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  trend: string;
  color: "cyan" | "green" | "yellow" | "red";
}) {
  const colorClasses = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    yellow: "text-accent-yellow",
    red: "text-accent-red",
  };

  return (
    <div className="rounded-xl bg-bg-secondary p-6">
      <div className="flex items-center justify-between">
        <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        {trend !== "0" && (
          <div className="flex items-center gap-1 text-sm font-medium text-accent-green">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
        <p className="mt-2 text-sm text-text-tertiary">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg bg-bg-secondary p-4 transition-all hover:scale-[1.02] hover:bg-bg-tertiary"
    >
      <Icon className="h-6 w-6 text-accent-cyan" />
      <span className="font-medium text-text-primary">{children}</span>
    </a>
  );
}
