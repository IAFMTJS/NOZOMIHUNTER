import type { DungeonRunContract } from "@/contracts/dungeon-contract"

/** Boss integrity is always 0–100 (canonical with dungeonMasterRuleSystem). */
export const BOSS_INTEGRITY_MAX = 100

export function bossVitalityMaxForPhase(_run: DungeonRunContract): number {
  return BOSS_INTEGRITY_MAX
}

export function bossVitalityCurrent(run: DungeonRunContract): number {
  const v = run.bossIntegrity ?? BOSS_INTEGRITY_MAX
  return Math.max(0, Math.min(BOSS_INTEGRITY_MAX, v))
}

export function bossVitalityPercent(run: DungeonRunContract): number {
  return bossVitalityCurrent(run)
}

export function applyBossDamage(
  run: DungeonRunContract,
  damagePercent: number
): DungeonRunContract {
  const current = bossVitalityCurrent(run)
  const next = Math.max(0, current - Math.max(0, damagePercent))
  return {
    ...run,
    bossVitalityMax: BOSS_INTEGRITY_MAX,
    bossIntegrity: next,
  }
}

export function damageBossOnCorrect(
  run: DungeonRunContract,
  streak: number
): DungeonRunContract {
  const phases =
    run.dungeon.boss?.phaseSpecs?.length ?? run.dungeon.boss?.phases ?? 2
  const perPhase = BOSS_INTEGRITY_MAX / Math.max(1, phases)
  const extra = streak >= 3 ? 2 : 0
  return applyBossDamage(run, perPhase + extra)
}

export function restoreBossOnWrong(run: DungeonRunContract): DungeonRunContract {
  const current = bossVitalityCurrent(run)
  return {
    ...run,
    bossIntegrity: Math.min(BOSS_INTEGRITY_MAX, current + 5),
  }
}

export function initBossVitality(run: DungeonRunContract): DungeonRunContract {
  return {
    ...run,
    bossVitalityMax: BOSS_INTEGRITY_MAX,
    bossIntegrity: run.bossIntegrity ?? BOSS_INTEGRITY_MAX,
  }
}

export function isBossPhaseDefeated(run: DungeonRunContract): boolean {
  return bossVitalityCurrent(run) <= 0
}
