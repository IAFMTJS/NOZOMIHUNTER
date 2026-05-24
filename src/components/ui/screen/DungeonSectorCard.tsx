import Link from "next/link"
import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"
import { getDungeonThemeArt } from "@/config/dungeonThemeArt"
import { RankChip } from "@/components/ui/screen/RankChip"
import { rankFromLevel } from "@/systems/progression/rankFromLevel"
import { estimatedDungeonSuccessRate } from "@/systems/presentation/questPresentationSystem"

interface DungeonSectorCardProps {
  definition: DungeonDefinitionConfig
  locked: boolean
  hunterPower: number
  href: string
}

export function DungeonSectorCard({
  definition,
  locked,
  hunterPower,
  href,
}: DungeonSectorCardProps) {
  const art = getDungeonThemeArt(definition.theme)
  const rank = rankFromLevel(definition.minLevel)
  const successRate = estimatedDungeonSuccessRate(
    hunterPower,
    definition.recommendedPower
  )
  const maxDifficulty = Math.max(
    ...definition.encounterPlan.map((e) => e.difficulty)
  )

  const card = (
    <article
      className={`nozomi-glass-card relative overflow-hidden rounded-xl ${
        locked ? "nozomi-dungeon-locked nozomi-glass-card-locked" : ""
      }`}
    >
      <div
        className={`relative h-28 ${art.gradientClass} ${art.vignetteClass}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <RankChip rank={rank} tone={locked ? "locked" : "accent"} />
        </div>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/55 to-black/30">
            <LockIcon />
          </div>
        )}
        <p className="absolute bottom-3 left-3 font-display text-lg font-semibold text-white/95">
          {definition.name}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 text-xs">
        <span className="text-[var(--muted)]">
          Enemy Lv. <span className="text-[var(--foreground)]">{maxDifficulty}</span>
        </span>
        <span className="text-[var(--muted)]">
          Success{" "}
          <span className="font-semibold text-[var(--accent-bright)]">
            {locked ? "—" : `${successRate}%`}
          </span>
        </span>
      </div>
    </article>
  )

  if (locked) return card

  return (
    <Link href={href} className="block transition-transform hover:scale-[1.01]">
      {card}
    </Link>
  )
}

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  )
}