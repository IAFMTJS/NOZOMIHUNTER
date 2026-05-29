import Link from "next/link"
import type { SectorCorruptionViewModel } from "@/systems/world/sectorCorruptionSystem"
import {
  corruptionStageAssetKey,
  corruptionStageClass,
  shellClassesForCorruptionBand,
} from "@/systems/presentation/corruptionPresentationSystem"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

interface SectorCorruptionCardProps {
  view: SectorCorruptionViewModel
}

export function SectorCorruptionCard({ view }: SectorCorruptionCardProps) {
  const shellClass = shellClassesForCorruptionBand(view.band)
  const stageClass = corruptionStageClass(view.band)
  const href = `/dungeons/${encodeURIComponent(view.sectorKey.replace(/^dungeon:/, ""))}`

  return (
    <Link
      href={href}
      className={`nozomi-sector-corruption relative block overflow-hidden rounded-xl border border-[var(--danger)]/30 bg-[var(--overlay-subtle)] p-4 transition-colors hover:border-[var(--danger)]/50 ${shellClass} ${stageClass}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <GameAssetImage
          assetKey={corruptionStageAssetKey(view.band)}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Sector corruption
          </p>
          <p className="mt-1 font-display text-lg text-[var(--foreground)]">{view.sectorName}</p>
        </div>
        <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--danger)]">
          {view.corruptionPercent}%
        </p>
      </div>
      <div
        className="nozomi-corruption-wave relative z-[1] mt-3 h-8 w-full rounded-md opacity-80"
        aria-hidden
      />
      <p className="relative z-[1] mt-2 text-xs text-[var(--danger)]">{view.subline}</p>
    </Link>
  )
}
