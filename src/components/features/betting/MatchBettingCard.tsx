"use client"

import { useEffect } from "react"
import { cn } from "~/lib/utils"
import { OddsButton } from "./OddsButton"
import { useBetSlipStore, poissonToOdds } from "~/lib/stores/betSlipStore"

interface MatchBettingCardProps {
  match: {
    match_id: string
    home_team: string
    away_team: string
    competition: string
    date_iso: string
    status: string
    odds: { "1": number | null; X: number | null; "2": number | null }
  }
}

export function MatchBettingCard({ match }: MatchBettingCardProps) {
  const { cacheOdds, getCachedOdds } = useBetSlipStore()

  const time = new Date(match.date_iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const isLive = match.status === "inprogress" || match.status === "halftime"

  // Resolve odds: use VPS odds if available, else cached Poisson
  const cached = getCachedOdds(match.match_id)
  const vpsHome = match.odds["1"] as number | undefined
  const vpsDraw = match.odds.X as number | undefined
  const vpsAway = match.odds["2"] as number | undefined

  const home = vpsHome ?? cached?.home ?? null
  const draw = vpsDraw ?? cached?.draw ?? null
  const away = vpsAway ?? cached?.away ?? null
  const bttsYes = cached?.bttsYes ?? null
  const bttsNo = cached?.bttsNo ?? null
  const over25 = cached?.over25 ?? null
  const under25 = cached?.under25 ?? null

  // Fetch Poisson odds if VPS odds are null and not yet cached
  useEffect(() => {
    if ((vpsHome === null || vpsDraw === null || vpsAway === null) && !cached) {
      fetch(`/api/beta/analytics/${match.match_id}/poisson`)
        .then((r) => r.json())
        .then((data: { available?: boolean; home_win_prob?: number; draw_prob?: number; away_win_prob?: number; over_25_prob?: number; btts_prob?: number }) => {
          if (data.available && data.home_win_prob && data.draw_prob && data.away_win_prob) {
            const computed = poissonToOdds(data.home_win_prob, data.draw_prob, data.away_win_prob)
            // Override with Poisson BTTS/O25 if available
            if (data.over_25_prob) {
              computed.over25 = Math.max(1.05, Math.round((1 / (data.over_25_prob * 1.06)) * 100) / 100)
              computed.under25 = Math.max(1.05, Math.round((1 / ((1 - data.over_25_prob) * 1.06)) * 100) / 100)
            }
            if (data.btts_prob) {
              computed.bttsYes = Math.max(1.05, Math.round((1 / (data.btts_prob * 1.06)) * 100) / 100)
              computed.bttsNo = Math.max(1.05, Math.round((1 / ((1 - data.btts_prob) * 1.06)) * 100) / 100)
            }
            cacheOdds(match.match_id, computed)
          }
        })
        .catch(() => null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.match_id])

  return (
    <div className="bg-bg-secondary rounded-xl overflow-hidden">
      {/* Match Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-bg-tertiary">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse shrink-0" />
            )}
            <p className="text-xs text-text-tertiary truncate">{match.competition}</p>
          </div>
          <p className="text-sm font-semibold text-text-primary">
            {match.home_team} <span className="text-text-tertiary font-normal">vs</span> {match.away_team}
          </p>
        </div>
        <span className={cn("text-xs font-mono shrink-0 ml-2", isLive ? "text-accent-green" : "text-text-tertiary")}>
          {isLive ? "LIVE" : time}
        </span>
      </div>

      {/* 1X2 Odds */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <OddsButton
            matchId={match.match_id}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            competition={match.competition}
            market="1X2:1"
            label="1"
            odds={home}
          />
          <OddsButton
            matchId={match.match_id}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            competition={match.competition}
            market="1X2:X"
            label="N"
            odds={draw}
          />
          <OddsButton
            matchId={match.match_id}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            competition={match.competition}
            market="1X2:2"
            label="2"
            odds={away}
          />
        </div>

        {/* BTTS & O/U */}
        {(bttsYes ?? over25) && (
          <div className="grid grid-cols-4 gap-1.5">
            <OddsButton
              matchId={match.match_id}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              competition={match.competition}
              market="BTTS:yes"
              label="LMM Oui"
              odds={bttsYes}
            />
            <OddsButton
              matchId={match.match_id}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              competition={match.competition}
              market="BTTS:no"
              label="LMM Non"
              odds={bttsNo}
            />
            <OddsButton
              matchId={match.match_id}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              competition={match.competition}
              market="O25"
              label="+2.5"
              odds={over25}
            />
            <OddsButton
              matchId={match.match_id}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              competition={match.competition}
              market="U25"
              label="-2.5"
              odds={under25}
            />
          </div>
        )}
      </div>
    </div>
  )
}
