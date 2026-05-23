import type { PlayerContract } from "@/contracts/player-contract"
import { HunterPortrait } from "./HunterPortrait"

interface HunterIdentityBlockProps {
  player: PlayerContract
  portraitClassName?: string
  auraClassName?: string
}

export function HunterIdentityBlock({
  player,
  portraitClassName = "",
  auraClassName = "",
}: HunterIdentityBlockProps) {
  return (
    <div
      className={`flex items-start gap-4 ${auraClassName}`}
    >
      <HunterPortrait
        rank={player.rank}
        codename={player.identity.codename}
        corruption={player.penalties.corruption}
        syncStatus={player.synchronization.status}
        className={portraitClassName}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-bright)]">
          {player.identity.registryId}
        </p>
        <p className="font-display text-2xl font-semibold leading-tight text-[var(--foreground)]">
          {player.identity.codename}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {player.username} · Rank {player.rank} · Lv {player.level}
        </p>
      </div>
    </div>
  )
}
