"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterProfilePanel } from "@/features/profile/components/HunterProfilePanel"
import { XPBar } from "@/components/XPBar"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { AudioMuteToggle } from "@/components/ui/AudioMuteToggle"

const LINKS = [
  { href: "/stats", label: "Operator metrics" },
  { href: "/system", label: "System status" },
  { href: "/vocabulary", label: "Threat index" },
  { href: "/achievements", label: "Achievements" },
]

export function ProfileMenuClient() {
  const { player, hunterPresentation, signOut } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading registry…</p>
      </HunterPage>
    )
  }

  const progress = xpProgressInCurrentLevel(player.xp, player.level)

  return (
    <HunterPage>
      <div className="mb-6">
        <HunterProfilePanel player={player} />
        <div className="mt-4">
          <XPBar
            currentXP={progress.current}
            requiredXP={progress.required}
            level={player.level}
            xpDebt={player.penalties.xpDebt}
          />
        </div>
      </div>

      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
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
