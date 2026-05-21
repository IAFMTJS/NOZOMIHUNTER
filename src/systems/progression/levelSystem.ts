import { PROGRESSION_CONFIG } from "@/config/progressionConfig"

export function xpRequiredForLevel(level: number): number {
  if (level < 1) return PROGRESSION_CONFIG.BASE_XP
  return Math.floor(
    PROGRESSION_CONFIG.BASE_XP *
      Math.pow(PROGRESSION_CONFIG.LEVEL_MULTIPLIER, level - 1)
  )
}

export function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += xpRequiredForLevel(l)
  }
  return total
}

export function levelFromXp(xp: number): number {
  let level = 1
  let accumulated = 0

  while (level < PROGRESSION_CONFIG.MAX_LEVEL) {
    const needed = xpRequiredForLevel(level)
    if (accumulated + needed > xp) break
    accumulated += needed
    level++
  }

  return level
}

export function xpProgressInCurrentLevel(
  xp: number,
  level: number
): { current: number; required: number } {
  const levelStart = totalXpForLevel(level)
  const required = xpRequiredForLevel(level)
  return {
    current: xp - levelStart,
    required,
  }
}
