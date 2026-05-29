"use client"

import { useState } from "react"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  aggregateRelicModifiers,
  MAX_RELIC_SLOTS,
  relicEffectsFromInventory,
} from "@/systems/inventory/relicEffectSystem"
import { DISCIPLINE_RESEARCH_NODES } from "@/config/disciplineResearchConfig"
import { canSpendDiscipline } from "@/systems/progression/disciplineCurrencySystem"
import { spendDisciplineAmount } from "@/systems/progression/disciplineSpendSystem"
import { Button } from "@/components/ui/Button"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

function relicAssetKey(itemKey: string): string {
  if (itemKey.includes("focus-lens")) return "relic.focus-lens"
  if (itemKey.includes("memory-core")) return "relic.memory-core"
  if (itemKey.includes("void-seal")) return "relic.void-seal"
  if (itemKey.includes("signal-cache")) return "relic.signal-cache"
  if (itemKey.includes("shadow-shard")) return "relic.shadow-shard"
  if (itemKey.includes("stamina-brew")) return "relic.stamina-brew"
  if (itemKey.includes("corruption-ward")) return "relic.corruption-ward"
  return "relic.focus-lens"
}

interface RelicSlotsRailProps {
  player: PlayerContract
}

export function RelicSlotsRail({ player }: RelicSlotsRailProps) {
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [busy, setBusy] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const equipped = player.inventory.filter((s) => s.equipped).slice(0, MAX_RELIC_SLOTS)
  const mods = aggregateRelicModifiers(player)
  const effects = relicEffectsFromInventory(player.inventory)
  const emptySlots = Math.max(0, MAX_RELIC_SLOTS - equipped.length)

  async function purchaseResearch(nodeId: string) {
    const node = DISCIPLINE_RESEARCH_NODES.find((n) => n.id === nodeId)
    if (!node) return
    setBusy(nodeId)
    try {
      const next = await spendDisciplineAmount(player, node.cost, node.id)
      setPlayer(next)
      setUnlocked((s) => new Set(s).add(nodeId))
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="nozomi-relic-slots rounded-xl border border-[var(--border-subtle)] bg-[var(--overlay-subtle)] p-4">
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Equipped relics
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {equipped.map((slot) => (
          <div
            key={slot.itemKey}
            className="relative rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-dim)] p-2 text-center"
          >
            <div className="mx-auto mb-1 h-8 w-8">
              <GameAssetImage
                assetKey={relicAssetKey(slot.itemKey)}
                alt=""
                width={32}
                height={32}
              />
            </div>
            <p className="truncate text-xs font-medium text-[var(--foreground)]">
              {slot.itemKey.replace(/^item:/, "")}
            </p>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="rounded-lg border border-dashed border-[var(--border-subtle)] p-2 text-center text-[10px] text-[var(--muted)]"
          >
            Empty
          </div>
        ))}
      </div>
      {effects.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
          {mods.xpBonusPercent > 0 && <li>+{mods.xpBonusPercent}% XP gain</li>}
          {mods.corruptionReductionPercent > 0 && (
            <li>-{mods.corruptionReductionPercent}% corruption pressure</li>
          )}
          {mods.accuracyBonusPercent > 0 && (
            <li>+{mods.accuracyBonusPercent}% accuracy</li>
          )}
        </ul>
      )}

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] uppercase tracking-widest text-[var(--accent-bright)]">
          Discipline research · {player.progression.discipline} available
        </p>
        <ul className="mt-2 space-y-2">
          {DISCIPLINE_RESEARCH_NODES.map((node) => {
            const done = unlocked.has(node.id)
            const cost = node.cost
            const canBuy = !done && canSpendDiscipline(player, cost)
            return (
              <li
                key={node.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-faint)] p-3"
              >
                <p className="text-sm font-medium text-[var(--foreground)]">{node.label}</p>
                <p className="text-xs text-[var(--muted)]">{node.description}</p>
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  variant={done ? "ghost" : "subtle"}
                  disabled={done || !canBuy || busy != null}
                  onClick={() => void purchaseResearch(node.id)}
                >
                  {done ? "Unlocked" : `Spend ${cost} discipline`}
                </Button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
