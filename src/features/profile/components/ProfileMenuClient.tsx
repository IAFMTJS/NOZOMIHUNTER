"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPortrait } from "@/components/hunter/HunterPortrait"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { CollapsibleSection } from "@/components/ui/screen/CollapsibleSection"
import { XPBar } from "@/components/XPBar"
import { GlassCard } from "@/components/ui/GlassCard"
import { RankChip } from "@/components/ui/screen/RankChip"
import { AudioMuteToggle } from "@/components/ui/AudioMuteToggle"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { getHunterPresentation } from "@/systems/presentation/hunterPresentationSystem"
import { rankDisplayTitle } from "@/systems/presentation/rankPresentationSystem"
import { buildProfileStats } from "@/features/profile/profileStatsPresentation"
import { getUnlockEntry } from "@/config/unlockRegistry"
import { profileSummary } from "@/features/profile/profilePresentation"

const LINKS = [
  { href: "/achievements", label: "Achievements" },
  { href: "/records", label: "Records" },
  { href: "/inventory", label: "Inventory" },
  { href: "/settings", label: "Registry controls" },
  { href: "/stats", label: "Core stats" },
  { href: "/system", label: "System status" },
  { href: "/vocabulary", label: "Threat index" },
]

export function ProfileMenuClient() {
  const { player, signOut } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading registry…</p>
      </HunterPage>
    )
  }

  const progress = xpProgressInCurrentLevel(player.xp, player.level)
  const presentation = getHunterPresentation(player)
  const stats = buildProfileStats(player)
  const { titles } = profileSummary(player)
  const titleLabel = stats.equippedTitle
    ? getUnlockEntry(stats.equippedTitle).label
    : null

  return (
    <HunterPage>
      <div className="nozomi-embedded overflow-hidden rounded-2xl">
        <HeroBanner title={player.identity.codename} rankLabel={player.rank} tall />
        <GlassCard tone="accent" className="relative -mt-6 space-y-5 rounded-t-none border-t-0">
          <div className="flex items-start gap-4">
            <HunterPortrait
              rank={player.rank}
              codename={player.identity.codename}
              corruption={player.penalties.corruption}
              syncStatus={player.synchronization.status}
              className={`h-20 w-20 shrink-0 ${presentation.portraitClass}`}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold text-[var(--foreground)]">
                {player.identity.codename}
              </p>
              <p className="text-sm text-[var(--muted)]">{player.username}</p>
              <p className="text-xs text-[var(--muted)]">{player.identity.registryId}</p>
              <div className="mt-2">
                <XPBar
                  currentXP={progress.current}
                  requiredXP={progress.required}
                  level={player.level}
                  xpDebt={player.penalties.xpDebt}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <RankChip rank={player.rank} tone="accent" />
            <p className="text-xs text-[var(--muted)]">{rankDisplayTitle(player.rank)}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4 nozomi-embedded">
        <h2 className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
          Hunter record
        </h2>
        <dl className="space-y-2.5 text-sm">
          {(
            [
              ["Missions completed", stats.missionsCompleted],
              ["Dungeons cleared", stats.dungeonsCleared],
              ["New words learned", stats.newWordsLearned],
              ["Play time", `${stats.playTimeHours}h`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="font-medium tabular-nums text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>

      {titleLabel && (
        <GlassCard tone="accent" className="mt-4 flex items-center gap-3 nozomi-embedded">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent-bright)]">
            ★
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Equipped title
            </p>
            <p className="font-display text-sm font-semibold text-[var(--foreground)]">
              {titleLabel}
            </p>
          </div>
        </GlassCard>
      )}

      {titles.length > 0 && (
        <GlassCard className="mt-4 nozomi-embedded">
          <CollapsibleSection title="Registry titles" count={titles.length}>
            <ul className="space-y-1 text-sm text-[var(--muted)]">
              {titles.map((t) => (
                <li key={t.key}>{t.label}</li>
              ))}
            </ul>
          </CollapsibleSection>
        </GlassCard>
      )}

      <ul className="nozomi-embedded mt-6 divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between px-4 py-3 text-sm text-[var(--foreground)] hover:bg-white/5"
            >
              {link.label}
              <span className="text-[var(--muted)]">›</span>
            </Link>
          </li>
        ))}
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Audio</span>
          <AudioMuteToggle />
        </li>
        <li>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full px-4 py-3 text-left text-sm text-[var(--danger)] hover:bg-white/5"
          >
            Logout
          </button>
        </li>
      </ul>
    </HunterPage>
  )
}
