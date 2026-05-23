"use client"

import { useEffect, useMemo, useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { loadGameplayEvents } from "@/services/supabase/recordsRepository"
import { loadCompletedQuestSnapshots } from "@/services/supabase/playerRepository"
import {
  formatCompletedContractRecord,
  formatGameplayRecord,
  type RecordLine,
} from "@/systems/records/recordsPresentationSystem"

export function RecordsClient() {
  const { user } = useHunterSession()
  const [lines, setLines] = useState<RecordLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const [events, completed] = await Promise.all([
          loadGameplayEvents(user.id, 25),
          loadCompletedQuestSnapshots(user.id, 10),
        ])
        if (cancelled) return
        const eventLines = events.map((e) =>
          formatGameplayRecord(e.id, e.event_type, e.payload, e.created_at)
        )
        const contractLines = completed.map((q) =>
          formatCompletedContractRecord(
            `quest-${q.id}`,
            q.title,
            new Date().toISOString(),
            q.rewards.xp
          )
        )
        const merged = [...eventLines, ...contractLines].sort(
          (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
        )
        setLines(merged.slice(0, 30))
      } catch {
        if (!cancelled) setLines([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const grouped = useMemo(() => lines, [lines])

  return (
    <HunterPage>
      <HunterPageBack href="/profile" label="Profile" />
      <h1 className="font-display text-xl font-semibold tracking-wide">Records</h1>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Registry log — contracts, extractions, and system events.
      </p>

      {loading && (
        <p className="mt-6 text-sm text-[var(--muted)]">Syncing archive…</p>
      )}

      {!loading && grouped.length === 0 && (
        <p className="mt-6 text-sm text-[var(--muted)]">
          No registry entries yet. Complete a contract to begin the log.
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {grouped.map((line) => (
          <li
            key={line.id}
            className={`rounded-xl border px-4 py-3 ${
              line.tone === "success"
                ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                : line.tone === "danger"
                  ? "border-[var(--danger)]/30 bg-[var(--danger)]/5"
                  : line.tone === "accent"
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : "border-[var(--border-subtle)] bg-black/20"
            }`}
          >
            <p className="text-sm font-medium text-[var(--foreground)]">
              {line.headline}
            </p>
            {line.detail && (
              <p className="mt-1 text-xs text-[var(--muted)]">{line.detail}</p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {new Date(line.at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </HunterPage>
  )
}
