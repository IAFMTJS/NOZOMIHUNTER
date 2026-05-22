"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { HunterShell } from "@/components/layout/HunterShell"
import { HunterProfilePanel } from "@/features/profile/components/HunterProfilePanel"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"

export default function ProfilePage() {
  const { user, loading, configured } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const isHydrated = usePlayerStore((s) => s.isHydrated)

  useEffect(() => {
    if (user?.id && !isHydrated) {
      void hydratePlayerFromDb(user.id)
    }
  }, [user?.id, isHydrated])

  if (loading) {
    return (
      <HunterShell pageTitle="Hunter profile" atmosphere={false}>
        <p className="text-[var(--muted)]">Syncing registry…</p>
      </HunterShell>
    )
  }

  if (!configured) {
    return (
      <HunterShell pageTitle="Hunter profile" maxWidth="md" atmosphere={false}>
        <p className="text-[var(--muted)]">Supabase not configured.</p>
      </HunterShell>
    )
  }

  if (!user) {
    return (
      <HunterShell pageTitle="Hunter profile" maxWidth="md" atmosphere={false}>
        <p>
          <Link href="/login" className="text-[var(--accent-bright)] hover:underline">
            Sign in
          </Link>{" "}
          to view your hunter profile.
        </p>
      </HunterShell>
    )
  }

  if (!player) {
    return (
      <HunterShell pageTitle="Hunter profile" atmosphere={false}>
        <p className="text-[var(--muted)]">Loading hunter data…</p>
      </HunterShell>
    )
  }

  return (
    <HunterShell
      pageTitle="Hunter profile"
      username={player.username}
      rank={player.rank}
      level={player.level}
      atmosphere={false}
    >
      <HunterProfilePanel player={player} />
    </HunterShell>
  )
}
