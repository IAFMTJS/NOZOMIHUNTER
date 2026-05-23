import type { DungeonForecastContract } from "@/systems/dungeons/dungeonForecastSystem"
import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"

interface NextGateForecastProps {
  forecast: DungeonForecastContract
}

export function NextGateForecast({ forecast }: NextGateForecastProps) {
  return (
    <Panel tone={forecast.isReady ? "inset" : "accent"} className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          {forecast.headline}
        </p>
        <StatusChip
          label={`D${forecast.dangerTier}`}
          tone={forecast.isReady ? "neutral" : "danger"}
        />
      </div>
      <p className="font-display text-lg font-semibold text-[var(--foreground)]">
        {forecast.dungeon.name}
      </p>
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        {forecast.subline}
      </p>
      <p className="font-mono text-xs text-[var(--muted)]">
        Advisory readiness {forecast.recommendedReadiness}% · yours{" "}
        {forecast.playerReadiness}%
      </p>
    </Panel>
  )
}
