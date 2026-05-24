import type { PlayerContract } from "@/contracts/player-contract"
import { Button } from "@/components/ui/Button"
import { activeBoostsForPlayer, hasActiveBoost } from "@/systems/economy/boostSystem"
import { retryMostRecentFailedContract, skipQuestObjective, freezeDungeonTimer } from "@/features/inventory/services/shopEffectActions"

interface ActiveBoostsRailProps {
  player: PlayerContract
  userId?: string
}

export function ActiveBoostsRail({ player, userId }: ActiveBoostsRailProps) {
  const boosts = activeBoostsForPlayer(player)
  const canRetry = Boolean(userId && hasActiveBoost(player, "QUEST_RETRY"))

  if (boosts.length === 0 && !canRetry) return null

  return (
    <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
        Active Enhancements
      </p>
      {boosts.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {boosts.map((boost) => (
            <li
              key={`${boost.itemKey}-${boost.effectType}`}
              className="rounded-full border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] text-[var(--foreground)]"
            >
              {boost.effectType.replace(/_/g, " ")}
              {boost.expiresAt
                ? ` · ${formatRemaining(boost.expiresAt)}`
                : boost.usesRemaining != null
                  ? ` · ${boost.usesRemaining} use${boost.usesRemaining === 1 ? "" : "s"}`
                  : ""}
            </li>
          ))}
        </ul>
      )}
      {canRetry && userId && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => void retryMostRecentFailedContract(userId)}
        >
          Retry failed contract
        </Button>
      )}
    </div>
  )
}

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "expiring"
  const min = Math.ceil(ms / 60_000)
  return `${min}m`
}
