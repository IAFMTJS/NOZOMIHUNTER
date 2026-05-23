import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"

export function parsePendingRewards(
  raw: unknown
): PendingRewardBundleContract | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  if (r.claimed === true) return null
  const itemsRaw = Array.isArray(r.items) ? r.items : []
  const items = itemsRaw.map((item) => {
    if (typeof item === "string") {
      return { itemKey: item, quantity: 1 }
    }
    const o = item as Record<string, unknown>
    return {
      itemKey: String(o.itemKey ?? o.key ?? "shadow-shard"),
      quantity: Number(o.quantity ?? 1),
    }
  })
  return {
    xpGained: Number(r.xpGained ?? 0),
    credits: Number(r.credits ?? 0),
    items,
    questId: r.questId != null ? String(r.questId) : undefined,
    claimed: false,
  }
}

export function clearPendingRewards(player: PlayerContract): PlayerContract {
  return { ...player, pendingRewards: null, updatedAt: new Date().toISOString() }
}

export function stagePendingRewards(
  player: PlayerContract,
  bundle: PendingRewardBundleContract
): PlayerContract {
  return { ...player, pendingRewards: bundle, updatedAt: new Date().toISOString() }
}
