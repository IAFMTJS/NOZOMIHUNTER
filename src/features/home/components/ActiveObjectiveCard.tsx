import Link from "next/link"
import type { AlmostThereObjectiveContract } from "@/contracts/player-contract"
import { Button } from "@/components/ui/Button"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

interface ActiveObjectiveCardProps {
  objective: AlmostThereObjectiveContract
}

export function ActiveObjectiveCard({ objective }: ActiveObjectiveCardProps) {
  return (
    <section className="nozomi-active-objective relative overflow-hidden rounded-2xl border border-[var(--accent)]/35 bg-[var(--accent-dim)] p-5">
      <div className="nozomi-hero-art-slot absolute inset-0 opacity-25">
        <GameAssetImage assetKey="hero.home.command" alt="" fill />
      </div>
      <div className="relative z-[1]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--accent-bright)]">
          Active objective
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--black-a40)]"
            aria-label={`${objective.progressPercent}% progress`}
          >
            <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
              {objective.progressPercent}%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl text-[var(--foreground)]">{objective.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{objective.detailLine}</p>
          </div>
        </div>
        <Link href={objective.ctaHref} className="mt-4 block">
          <Button variant="cta" className="w-full">
            {objective.ctaLabel}
          </Button>
        </Link>
      </div>
    </section>
  )
}
