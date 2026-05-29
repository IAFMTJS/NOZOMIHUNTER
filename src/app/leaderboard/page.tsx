import { HunterPage } from "@/components/layout/HunterPage"
import { LeaderboardClient } from "@/features/leaderboard/components/LeaderboardClient"

export const metadata = {
  title: "Leaderboard — NOZOMI",
}

export default function LeaderboardPage() {
  return (
    <HunterPage>
      <h1 className="font-display text-2xl text-[var(--foreground)]">Sector leaderboard</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Weekly and lifetime prestige — synced from registry events
      </p>
      <LeaderboardClient />
    </HunterPage>
  )
}
