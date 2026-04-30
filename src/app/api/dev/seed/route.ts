import { NextResponse } from "next/server"
import { db } from "~/server/db"

export const dynamic = "force-dynamic"

const COMPETITIONS = [
  { ext: "ligue1", name: "Ligue 1", country: "France", tier: 1 },
  { ext: "ucl",    name: "UEFA Champions League", country: "Europe", tier: 1 },
  { ext: "pl",     name: "Premier League", country: "England", tier: 1 },
]

const TEAMS = [
  { ext: "psg",     name: "Paris Saint-Germain", short: "PSG",  country: "France" },
  { ext: "om",      name: "Olympique de Marseille", short: "OM", country: "France" },
  { ext: "city",    name: "Manchester City",     short: "MCI",  country: "England" },
  { ext: "arsenal", name: "Arsenal",             short: "ARS",  country: "England" },
  { ext: "barca",   name: "FC Barcelona",        short: "BAR",  country: "Spain" },
  { ext: "real",    name: "Real Madrid",         short: "RMA",  country: "Spain" },
  { ext: "lyon",    name: "Olympique Lyonnais",  short: "OL",   country: "France" },
  { ext: "monaco",  name: "AS Monaco",           short: "MON",  country: "France" },
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

const MATCH_DEFS = [
  { ext: "psg-om",         home: "psg",     away: "om",      comp: "ligue1", ko: kickoff(21),    odds: { "1": 1.75, X: 3.60, "2": 4.80 } },
  { ext: "city-arsenal",   home: "city",    away: "arsenal", comp: "ucl",    ko: kickoff(20),    odds: { "1": 1.90, X: 3.20, "2": 4.20 } },
  { ext: "barca-real",     home: "barca",   away: "real",    comp: "ucl",    ko: kickoff(21, 1), odds: { "1": 2.10, X: 3.40, "2": 3.30 } },
  { ext: "lyon-monaco",    home: "lyon",    away: "monaco",  comp: "ligue1", ko: kickoff(19),    odds: { "1": 2.30, X: 3.10, "2": 3.20 } },
  { ext: "arsenal-city-2", home: "arsenal", away: "city",    comp: "pl",     ko: kickoff(16, 1), odds: { "1": 3.20, X: 3.50, "2": 2.10 } },
]

type SignalDef = {
  signalType: string
  agentType: string
  prediction: string
  confidence: number
  reasoning: string
  odds: number
  reports: { agentType: string; analysis: string; confidence: number; supports: boolean }[]
}

function buildSignals(home: string, away: string, matchOdds: Record<string, number>): SignalDef[] {
  const h1 = matchOdds["1"] ?? 2
  const hx = matchOdds["X"] ?? 3.2
  const h2 = matchOdds["2"] ?? 3.5
  const favorite = h1 < h2 ? "home" : "away"
  const favOdds = Math.min(h1, h2)
  const favTeam = favorite === "home" ? home : away
  const undTeam = favorite === "home" ? away : home
  const favConf = Math.min(0.88, 0.5 + (1 / favOdds) * 0.6)

  return [
    {
      signalType: "RESULT",
      agentType: "SCOUT",
      prediction: favorite,
      confidence: parseFloat(favConf.toFixed(2)),
      reasoning: `${favTeam} dominent leurs dernières sorties (4V/5), ${undTeam} en difficulté à l'extérieur.`,
      odds: favOdds,
      reports: [
        { agentType: "SCOUT",    analysis: `${favTeam} affiche 4 victoires sur leurs 5 derniers matchs toutes compétitions confondues. Leur organisation défensive est solide avec seulement 2 buts encaissés.`, confidence: parseFloat(favConf.toFixed(2)), supports: true },
        { agentType: "H2H",      analysis: `Sur les 8 dernières confrontations directes, ${favTeam} s'impose 5 fois, 2 nuls, 1 défaite. La tendance est nettement favorable à domicile.`, confidence: Math.min(0.85, favConf + 0.04), supports: true },
        { agentType: "MOMENTUM", analysis: `L'indice de momentum de ${favTeam} est en hausse sur 3 semaines. Leur pressing haut et leur vitesse de transition créent des opportunités constantes.`, confidence: Math.max(0.55, favConf - 0.08), supports: true },
        { agentType: "FORM",     analysis: `${undTeam} traverse une période de turbulences : 3 matchs sans victoire, défense poreuse (7 buts encaissés sur 3 rencontres). Forme préoccupante.`, confidence: Math.max(0.52, favConf - 0.12), supports: true },
        { agentType: "ODDS",     analysis: `La cote de ${favConf > 0.72 ? "SIGNAL FORT" : "SIGNAL MOYEN"} est cohérente avec les probabilités implicites du marché. La valeur attendue est légèrement positive (EV estimé +${((favConf * favOdds - 1) * 100).toFixed(0)}%).`, confidence: Math.max(0.50, favConf - 0.15), supports: favConf * favOdds > 1.05 },
      ],
    },
    {
      signalType: "BTTS",
      agentType: "GOALS",
      prediction: "yes",
      confidence: 0.67,
      reasoning: `Les deux équipes ont scoré dans 6 des 8 derniers face-à-face. Attaques prolifiques des deux côtés.`,
      odds: 1.75,
      reports: [
        { agentType: "GOALS",  analysis: `${home} marque en moyenne 2.1 buts par match à domicile. ${away} inscrit également dans 78% de ses déplacements. La probabilité BTTS calculée est de 67%.`, confidence: 0.67, supports: true },
        { agentType: "H2H",    analysis: `Sur les 8 derniers face-à-face, les deux équipes ont trouvé le chemin des filets dans 6 rencontres (75%). L'historique plaide clairement pour le BTTS.`, confidence: 0.72, supports: true },
        { agentType: "FORM",   analysis: `${home} a marqué lors de ses 7 derniers matchs sans exception. ${away} ne garde le zéro que 2 fois sur 10 en déplacement.`, confidence: 0.63, supports: true },
        { agentType: "VALUE",  analysis: `La cote 1.75 pour BTTS-Oui représente une légère valeur. La probabilité implicite est 57% alors que nos modèles donnent 67%. EV positif estimé +17%.`, confidence: 0.61, supports: true },
        { agentType: "RISK",   analysis: `Le BTTS dépend fortement des compositions — une rotation importante ou un buteur clé absent peut effondrer cette prédiction. Risque modéré si titularisations incertaines.`, confidence: 0.48, supports: false },
      ],
    },
    {
      signalType: "CORNERS",
      agentType: "CORNERS",
      prediction: "over",
      confidence: 0.71,
      reasoning: `Moyenne de 11.4 corners/match sur les 5 dernières rencontres impliquant ces deux équipes.`,
      odds: 1.85,
      reports: [
        { agentType: "CORNERS",  analysis: `${home} génère en moyenne 6.2 corners par match à domicile (top 3 de leur championnat). ${away} défend souvent en bloc bas, provoquant des corners répétés.`, confidence: 0.71, supports: true },
        { agentType: "SCOUT",    analysis: `Sur les 5 derniers matchs à domicile de ${home}, la moyenne est de 12.4 corners au total. Cette tendance est stable depuis 3 mois.`, confidence: 0.68, supports: true },
        { agentType: "MOMENTUM", analysis: `${home} joue un jeu positionnel avec beaucoup de centres depuis les couloirs. Les séquences offensives longues génèrent systématiquement des corners.`, confidence: 0.65, supports: true },
        { agentType: "ODDS",     analysis: `Le marché propose over 10.5 corners à 1.85. Avec une probabilité calculée de 71%, la valeur est présente. EV estimé +31%.`, confidence: 0.58, supports: true },
        { agentType: "RISK",     analysis: `Style de jeu variable selon l'adversaire. Si ${away} adopte un pressing haut plutôt qu'un bloc bas, la production de corners pourrait baisser significativement.`, confidence: 0.52, supports: false },
      ],
    },
  ]
}

export async function POST() {
  // 1. Upsert competitions
  const comps: Record<string, { id: string }> = {}
  for (const c of COMPETITIONS) {
    const rec = await db.competition.upsert({
      where: { externalId: c.ext },
      create: { externalId: c.ext, name: c.name, country: c.country, tier: c.tier, season: "2024-25" },
      update: {},
    })
    comps[c.ext] = rec
  }

  // 2. Upsert teams
  const teams: Record<string, { id: string }> = {}
  for (const t of TEAMS) {
    const rec = await db.team.upsert({
      where: { externalId: t.ext },
      create: { externalId: t.ext, name: t.name, shortName: t.short, country: t.country },
      update: {},
    })
    teams[t.ext] = rec
  }

  // 3. Upsert matches
  const matchIds: Record<string, string> = {}
  for (const m of MATCH_DEFS) {
    const homeId = teams[m.home]!.id
    const awayId = teams[m.away]!.id
    const compId = comps[m.comp]!.id
    const rec = await db.match.upsert({
      where: { externalId: m.ext },
      create: { externalId: m.ext, homeTeamId: homeId, awayTeamId: awayId, competitionId: compId, kickoffTime: m.ko, status: "SCHEDULED", odds: m.odds },
      update: { kickoffTime: m.ko, odds: m.odds },
    })
    matchIds[m.ext] = rec.id
  }

  // 4. Seed AIPicks + AgentReports (3 signals × 5 agents per match)
  let picksCreated = 0
  let reportsCreated = 0

  for (const m of MATCH_DEFS) {
    const matchId = matchIds[m.ext]
    if (!matchId) continue
    const homeTeam = TEAMS.find((t) => t.ext === m.home)!.name
    const awayTeam = TEAMS.find((t) => t.ext === m.away)!.name
    const signals = buildSignals(homeTeam, awayTeam, m.odds as Record<string, number>)

    for (const sig of signals) {
      // Delete existing picks for this match+signalType to allow re-seeding
      await db.aIPick.deleteMany({ where: { matchId, signalType: sig.signalType } })

      const pick = await db.aIPick.create({
        data: {
          matchId,
          signalType: sig.signalType,
          agentType: sig.agentType,
          prediction: sig.prediction,
          confidence: sig.confidence,
          reasoning: sig.reasoning,
          odds: sig.odds,
          expiresAt: m.ko,
        },
      })
      picksCreated++

      for (const r of sig.reports) {
        await db.agentReport.create({
          data: {
            pickId: pick.id,
            agentType: r.agentType,
            analysis: r.analysis,
            confidence: r.confidence,
            supports: r.supports,
          },
        })
        reportsCreated++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    seeded: {
      competitions: COMPETITIONS.length,
      teams: TEAMS.length,
      matches: MATCH_DEFS.length,
      aiPicks: picksCreated,
      agentReports: reportsCreated,
    },
  })
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 })
  await db.agentReport.deleteMany()
  await db.aIPick.deleteMany()
  await db.match.deleteMany()
  await db.team.deleteMany()
  await db.competition.deleteMany()
  return NextResponse.json({ ok: true, message: "All seed data deleted" })
}
