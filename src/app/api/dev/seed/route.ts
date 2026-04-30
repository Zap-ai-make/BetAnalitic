import { NextResponse } from "next/server"
import { db } from "~/server/db"

export const dynamic = "force-dynamic"

const COMPETITIONS = [
  { ext: "ligue1", name: "Ligue 1", country: "France", tier: 1 },
  { ext: "ucl",    name: "UEFA Champions League", country: "Europe", tier: 1 },
  { ext: "pl",     name: "Premier League", country: "England", tier: 1 },
]

const TEAMS = [
  { ext: "psg",     name: "Paris Saint-Germain", short: "PSG",     country: "France" },
  { ext: "om",      name: "Olympique de Marseille", short: "OM",   country: "France" },
  { ext: "city",    name: "Manchester City",     short: "MCI",     country: "England" },
  { ext: "arsenal", name: "Arsenal",             short: "ARS",     country: "England" },
  { ext: "barca",   name: "FC Barcelona",        short: "BAR",     country: "Spain" },
  { ext: "real",    name: "Real Madrid",         short: "RMA",     country: "Spain" },
  { ext: "lyon",    name: "Olympique Lyonnais",  short: "OL",      country: "France" },
  { ext: "monaco",  name: "AS Monaco",           short: "MON",     country: "France" },
]

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const kickoff = (hour: number, offsetDays = 0) => {
  const d = new Date(today())
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, 0, 0, 0)
  return d
}

export async function POST() {
  // ── 1. Upsert competitions ────────────────────────────────────────────────
  const comps: Record<string, { id: string }> = {}
  for (const c of COMPETITIONS) {
    const rec = await db.competition.upsert({
      where: { externalId: c.ext },
      create: { externalId: c.ext, name: c.name, country: c.country, tier: c.tier, season: "2024-25" },
      update: {},
    })
    comps[c.ext] = rec
  }

  // ── 2. Upsert teams ───────────────────────────────────────────────────────
  const teams: Record<string, { id: string }> = {}
  for (const t of TEAMS) {
    const rec = await db.team.upsert({
      where: { externalId: t.ext },
      create: { externalId: t.ext, name: t.name, shortName: t.short, country: t.country },
      update: {},
    })
    teams[t.ext] = rec
  }

  // ── 3. Seed matches ───────────────────────────────────────────────────────
  const matchDefs = [
    { ext: "psg-om-today",    home: "psg",     away: "om",      comp: "ligue1", ko: kickoff(21),    odds: { "1": 1.75, X: 3.60, "2": 4.80 } },
    { ext: "city-arsenal",    home: "city",    away: "arsenal", comp: "ucl",    ko: kickoff(20),    odds: { "1": 1.90, X: 3.20, "2": 4.20 } },
    { ext: "barca-real",      home: "barca",   away: "real",    comp: "ucl",    ko: kickoff(21, 1), odds: { "1": 2.10, X: 3.40, "2": 3.30 } },
    { ext: "lyon-monaco",     home: "lyon",    away: "monaco",  comp: "ligue1", ko: kickoff(19),    odds: { "1": 2.30, X: 3.10, "2": 3.20 } },
    { ext: "arsenal-city-pl", home: "arsenal", away: "city",    comp: "pl",     ko: kickoff(16, 1), odds: { "1": 3.20, X: 3.50, "2": 2.10 } },
  ]

  const matchIds: Record<string, string> = {}
  for (const m of matchDefs) {
    const homeId = teams[m.home]!.id
    const awayId = teams[m.away]!.id
    const compId = comps[m.comp]!.id
    const rec = await db.match.upsert({
      where: { externalId: m.ext },
      create: {
        externalId: m.ext,
        homeTeamId: homeId,
        awayTeamId: awayId,
        competitionId: compId,
        kickoffTime: m.ko,
        status: "SCHEDULED",
        odds: m.odds,
      },
      update: { kickoffTime: m.ko, odds: m.odds },
    })
    matchIds[m.ext] = rec.id
  }

  // ── 4. Seed AIPicks ───────────────────────────────────────────────────────
  const pickDefs = [
    {
      matchExt: "psg-om-today",
      agentType: "SCOUT",
      prediction: "home",
      confidence: 0.83,
      reasoning: "PSG invaincu à domicile cette saison (5V/5), OM en difficulté à l'extérieur (1V/5).",
      odds: 1.75,
    },
    {
      matchExt: "city-arsenal",
      agentType: "PREDICTION",
      prediction: "home",
      confidence: 0.74,
      reasoning: "Man City domine les confrontations directes (4V/5 UCL), Arsenal sans Saka suspendu.",
      odds: 1.90,
    },
    {
      matchExt: "barca-real",
      agentType: "ODDS",
      prediction: "draw",
      confidence: 0.62,
      reasoning: "Clasico historiquement équilibré (3V/3N/3D en 9 derniers), les deux équipes en forme.",
      odds: 3.40,
    },
    {
      matchExt: "lyon-monaco",
      agentType: "ODDS",
      prediction: "away",
      confidence: 0.58,
      reasoning: "Monaco meilleure attaque déplacée (14 buts ext.), Lyon en crise (3D de suite).",
      odds: 3.20,
    },
    {
      matchExt: "arsenal-city-pl",
      agentType: "RISK",
      prediction: "away",
      confidence: 0.71,
      reasoning: "City supérieur physiquement et tactiquement, Haaland retrouve sa forme (4 buts en 3 matchs).",
      odds: 2.10,
    },
  ]

  let created = 0
  for (const p of pickDefs) {
    const matchId = matchIds[p.matchExt]
    if (!matchId) continue
    const match = matchDefs.find((m) => m.ext === p.matchExt)!
    await db.aIPick.upsert({
      where: { matchId },
      create: {
        matchId,
        agentType: p.agentType,
        prediction: p.prediction,
        confidence: p.confidence,
        reasoning: p.reasoning,
        odds: p.odds,
        expiresAt: match.ko,
      },
      update: {
        agentType: p.agentType,
        prediction: p.prediction,
        confidence: p.confidence,
        reasoning: p.reasoning,
        odds: p.odds,
        expiresAt: match.ko,
      },
    })
    created++
  }

  return NextResponse.json({
    ok: true,
    seeded: {
      competitions: COMPETITIONS.length,
      teams: TEAMS.length,
      matches: matchDefs.length,
      aiPicks: created,
    },
  })
}

export async function DELETE() {
  await db.aIPick.deleteMany()
  await db.match.deleteMany()
  await db.team.deleteMany()
  await db.competition.deleteMany()
  return NextResponse.json({ ok: true, message: "All seed data deleted" })
}
