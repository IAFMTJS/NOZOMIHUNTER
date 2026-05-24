import { RPG_STATS_CONFIG } from "@/config/rpgStatsConfig"
import { getUnlockEntry } from "@/config/unlockRegistry"
import { levelDisplayTitle } from "@/systems/presentation/levelPresentationSystem"
import type { LevelUpCeremonyViewModel, StatGainLine } from "./ceremonyTypes"

const STAT_LABELS: Record<keyof typeof RPG_STATS_CONFIG.LEVEL_UP_DELTA, string> = {
  intelligence: "Memory",
  agility: "Speed",
  strength: "Focus",
  vitality: "Vitality",
}

export function buildLevelUpStatGains(levelsGained: number): StatGainLine[] {
  if (levelsGained <= 0) return []
  const delta = RPG_STATS_CONFIG.LEVEL_UP_DELTA
  return (Object.keys(delta) as (keyof typeof delta)[]).map((key) => ({
    label: STAT_LABELS[key],
    delta: delta[key] * levelsGained,
  }))
}

export function buildLevelUpCeremonyViewModel(
  previousLevel: number,
  level: number,
  unlockKeys: string[]
): LevelUpCeremonyViewModel {
  const levelsGained = Math.max(0, level - previousLevel)
  return {
    previousLevel,
    level,
    title: levelDisplayTitle(level),
    statGains: buildLevelUpStatGains(levelsGained),
    unlockLabels: unlockKeys.map((k) => getUnlockEntry(k).label),
  }
}
