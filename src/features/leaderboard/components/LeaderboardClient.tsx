"use client"

import { useEffect, useState } from "react"
import { Panel } from "@/components/ui/Panel"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { loadGameplayEvents } from "@/services/supabase/recordsRepository"
import {
  fetchGlobalLeaderboard,
  fetchLifetimeLeaderboard,
} from "@/services/supabase/leaderboardRepository"
import {
  aggregateLeaderboardFromEvents,
  type LeaderboardEntry,
} from "@/systems/live/leaderboardSystem"

type LeaderboardTab = "weekly" | "lifetime"

export function LeaderboardClient() {
  const player = usePlayerStore((s) => s.player)
  const [tab, setTab] = useState<LeaderboardTab>("weekly")
  const [rows, setRows] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!player?.id) return
    let cancelled = false
    void (async () => {
      try {
        const global =
          tab === "lifetime"
            ? await fetchLifetimeLeaderboard(20)
            : await fetchGlobalLeaderboard(20)
        if (global.some((r) => r.score > 0)) {
          if (!cancelled) setRows(global)
          return
        }
        const events = await loadGameplayEvents(player.id, 80)
        const board = aggregateLeaderboardFromEvents(
          events,
          player.identity.codename || player.username
        )
        if (!cancelled) setRows(board)
      } catch {
        if (!cancelled) {
          const { buildLeaderboardPreview } = await import(
            "@/systems/live/leaderboardSystem"
          )
          setRows(buildLeaderboardPreview())
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [player?.id, player?.username, player?.identity.codename, tab])

  const selfLabel = player?.identity.codename || player?.username

  return (
    <Panel tone="inset" className="mt-4">
      <div className="mb-4 flex gap-2">
        {(["weekly", "lifetime"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
              tab === t
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-bright)]"
                : "border-[var(--border-subtle)] text-[var(--muted)]"
            }`}
          >
            {t === "weekly" ? "Weekly" : "Lifetime"}
          </button>
        ))}
      </div>
      <ol className="space-y-2">
        {rows.map((row) => {
          const isSelf = selfLabel && row.label === selfLabel
          return (
            <li
              key={`${tab}-${row.rank}-${row.label}`}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                isSelf
                  ? "border-[var(--accent)] bg-[var(--accent-muted)]/30"
                  : "border-[var(--border-subtle)]"
              }`}
            >
              <span className="text-[var(--foreground)]">
                #{row.rank} {row.label}
                {isSelf ? " (you)" : ""}
              </span>
              <span className="font-mono text-xs text-[var(--accent-bright)]">
                {row.tier} · {row.score}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-xs text-[var(--muted)]">
        {tab === "weekly"
          ? "Weekly board ranks operators by extractions in the last 7 days."
          : "Lifetime board aggregates all registry extractions."}
      </p>
    </Panel>
  )
}
