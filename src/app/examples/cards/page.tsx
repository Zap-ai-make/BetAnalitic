"use client"

import { MatchCard } from "~/components/features/match/MatchCard"
import { RoomCard } from "~/components/features/room/RoomCard"

export default function CardsExamplesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-bg-primary text-text-primary font-body p-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Cards Components Examples
          </h1>
          <p className="font-body text-base text-text-secondary">
            MatchCard et RoomCard avec design tokens
          </p>
        </div>

        {/* MatchCard Examples */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-cyan pl-4">
            MatchCard Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LIVE match with tags */}
            <MatchCard
              match={{
                id: "1",
                status: "live",
                time: "20:45",
                homeTeam: "PSG",
                awayTeam: "OM",
                league: "Ligue 1",
                tags: ["Derby", "Clasico", "Top 6"],
                analysisCount: 234,
              }}
            />

            {/* LIVE match without tags */}
            <MatchCard
              match={{
                id: "2",
                status: "live",
                time: "20:45",
                homeTeam: "Real Madrid",
                awayTeam: "Barcelona",
                league: "La Liga",
                analysisCount: 892,
              }}
            />

            {/* Upcoming match with tags */}
            <MatchCard
              match={{
                id: "3",
                status: "upcoming",
                time: "15:00",
                homeTeam: "Lyon",
                awayTeam: "Monaco",
                league: "Ligue 1",
                tags: ["Top Match"],
                analysisCount: 89,
              }}
            />

            {/* Upcoming match without tags */}
            <MatchCard
              match={{
                id: "4",
                status: "upcoming",
                time: "17:30",
                homeTeam: "Lille",
                awayTeam: "Nice",
                league: "Ligue 1",
                analysisCount: 45,
              }}
            />
          </div>
        </section>

        {/* RoomCard Examples */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-orange pl-4">
            RoomCard Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room with agent-scout color */}
            <RoomCard
              room={{
                id: "1",
                name: "Ligue 1 Masters",
                badge: "🏆",
                accentColor: "agent-scout",
                onlineCount: 45,
                memberCount: 234,
              }}
              onClick={() => console.log("Room 1 clicked")}
            />

            {/* Room with accent-cyan */}
            <RoomCard
              room={{
                id: "2",
                name: "Analyse Tactique",
                badge: "🎯",
                accentColor: "accent-cyan",
                onlineCount: 12,
                memberCount: 89,
              }}
              onClick={() => console.log("Room 2 clicked")}
            />

            {/* Room with accent-orange */}
            <RoomCard
              room={{
                id: "3",
                name: "Pronostics Express",
                badge: "⚡",
                accentColor: "accent-orange",
                onlineCount: 28,
                memberCount: 156,
              }}
              onClick={() => console.log("Room 3 clicked")}
            />

            {/* Room with agent-insider color */}
            <RoomCard
              room={{
                id: "4",
                name: "Transferts & Rumeurs",
                badge: "💼",
                accentColor: "agent-insider",
                onlineCount: 67,
                memberCount: 421,
              }}
              onClick={() => console.log("Room 4 clicked")}
            />
          </div>
        </section>

        {/* Real-world Example: Match Analysis Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-gold pl-4">
            Real-world Example: Match Analysis Section
          </h2>

          <div className="bg-bg-secondary rounded-lg p-6 space-y-4">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              Matchs du Jour
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MatchCard
                match={{
                  id: "5",
                  status: "live",
                  time: "20:00",
                  homeTeam: "Man City",
                  awayTeam: "Arsenal",
                  league: "Premier League",
                  tags: ["Premier League", "Top 6"],
                  analysisCount: 567,
                }}
              />

              <MatchCard
                match={{
                  id: "6",
                  status: "live",
                  time: "20:00",
                  homeTeam: "Bayern",
                  awayTeam: "Dortmund",
                  league: "Bundesliga",
                  tags: ["Bundesliga", "Der Klassiker"],
                  analysisCount: 423,
                }}
              />

              <MatchCard
                match={{
                  id: "7",
                  status: "upcoming",
                  time: "22:00",
                  homeTeam: "Juventus",
                  awayTeam: "Inter",
                  league: "Serie A",
                  tags: ["Serie A", "Derby"],
                  analysisCount: 198,
                }}
              />
            </div>
          </div>
        </section>

        {/* Real-world Example: Room List Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-red pl-4">
            Real-world Example: Room List Section
          </h2>

          <div className="bg-bg-secondary rounded-lg p-6 space-y-4">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              Salles Actives
            </h3>

            <div className="space-y-3">
              <RoomCard
                room={{
                  id: "5",
                  name: "Champions League Live",
                  badge: "⚽",
                  accentColor: "accent-cyan",
                  onlineCount: 234,
                  memberCount: 1256,
                }}
                onClick={() => console.log("Room 5 clicked")}
              />

              <RoomCard
                room={{
                  id: "6",
                  name: "Paris SG Officiel",
                  badge: "🔴🔵",
                  accentColor: "agent-referee",
                  onlineCount: 156,
                  memberCount: 892,
                }}
                onClick={() => console.log("Room 6 clicked")}
              />

              <RoomCard
                room={{
                  id: "7",
                  name: "Statistiques Avancées",
                  badge: "📊",
                  accentColor: "agent-tactic",
                  onlineCount: 34,
                  memberCount: 178,
                }}
                onClick={() => console.log("Room 7 clicked")}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
