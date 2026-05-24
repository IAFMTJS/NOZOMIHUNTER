import type { DungeonModifierContract } from "@/contracts/game-mode-contract"

const MODIFIER_POOL: Omit<DungeonModifierContract, "id">[] = [
  {
    label: "Timer Compression",
    timerMultiplier: 0.85,
    corruptionMutation: 2,
  },
  {
    label: "Signal Jam",
    timerMultiplier: 0.9,
    replayBan: true,
    corruptionMutation: 1,
  },
  {
    label: "Corruption Bloom",
    corruptionMutation: 5,
  },
  {
    label: "No Replay Buffer",
    replayBan: true,
    corruptionMutation: 3,
  },
  {
    label: "Deep Static",
    timerMultiplier: 0.8,
    corruptionMutation: 4,
  },
]

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

export function rollDungeonModifiers(
  seed: string,
  count = 2
): DungeonModifierContract[] {
  const h = hashSeed(seed)
  const picked: DungeonModifierContract[] = []
  const used = new Set<number>()

  for (let i = 0; picked.length < count && i < MODIFIER_POOL.length * 2; i++) {
    const idx = (h + i * 17) % MODIFIER_POOL.length
    if (used.has(idx)) continue
    used.add(idx)
    const base = MODIFIER_POOL[idx]!
    picked.push({
      id: `mod-${idx}-${(h + i) % 1000}`,
      ...base,
    })
  }

  return picked
}

export function combinedTimerMultiplier(
  modifiers: DungeonModifierContract[] | undefined
): number {
  if (!modifiers?.length) return 1
  return modifiers.reduce((acc, m) => acc * (m.timerMultiplier ?? 1), 1)
}

export function combinedCorruptionMutation(
  modifiers: DungeonModifierContract[] | undefined
): number {
  if (!modifiers?.length) return 0
  return modifiers.reduce((acc, m) => acc + (m.corruptionMutation ?? 0), 0)
}

export function modifierSummary(
  modifiers: DungeonModifierContract[] | undefined
): string {
  if (!modifiers?.length) return "No sector mutations."
  return modifiers.map((m) => m.label).join(" · ")
}

export function hasReplayBan(
  modifiers: DungeonModifierContract[] | undefined
): boolean {
  return modifiers?.some((m) => m.replayBan) ?? false
}
