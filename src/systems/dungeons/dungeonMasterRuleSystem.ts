import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { resolveMasterForRun } from "./dungeonMasterSystem"
import { initThreatState } from "./dungeonThreatSystem"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { getMasteryMap } from "@/systems/mastery/masterySystem"

export function applyMasterThreatInit(run: DungeonRunContract): DungeonRunContract {
  const master = resolveMasterForRun(run)
  let threat = run.threat ?? initThreatState(run.activeModifier)

  if (master.uniqueRuleId === "collapse-hunger" || master.uniqueRuleId === "hunger") {
    if (master.uniqueRuleId === "collapse-hunger") {
      threat = {
        ...threat,
        corruptionPressure: Math.max(threat.corruptionPressure, 50),
        bossAwareness: Math.max(threat.bossAwareness, 10),
      }
    }
  }

  return { ...run, threat }
}

export function applyGateProtocolRoutePenalty(
  run: DungeonRunContract,
  targetDanger: string | undefined
): DungeonRunContract {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "gate-protocol") return run
  if (targetDanger !== "high") return run

  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: {
      ...threat,
      corruptionPressure: Math.min(100, threat.corruptionPressure + 6),
      bossAwareness: Math.min(100, threat.bossAwareness + 5),
    },
    lastConsequenceLine: "Greedy route logged. Gate corruption routing enabled.",
  }
}

export function applyHungerOnWrong(run: DungeonRunContract): DungeonRunContract {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "hunger" && master.uniqueRuleId !== "collapse-hunger") {
    return run
  }
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: {
      ...threat,
      bossAwareness: Math.min(100, threat.bossAwareness + 14),
    },
    bossIntegrity: Math.max(0, (run.bossIntegrity ?? 100) - 8),
  }
}

export function applyHungerOnStreak(run: DungeonRunContract, streak: number): DungeonRunContract {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "hunger" && master.uniqueRuleId !== "collapse-hunger") {
    return run
  }
  if (streak < 3) return run
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: {
      ...threat,
      corruptionPressure: Math.max(0, threat.corruptionPressure - 6),
      bossAwareness: Math.max(0, threat.bossAwareness - 4),
    },
  }
}

export function applySignalDecayOnReplay(run: DungeonRunContract): DungeonRunContract {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "signal-decay") return run
  const threat = run.threat ?? initThreatState(run.activeModifier)
  return {
    ...run,
    threat: {
      ...threat,
      signalStability: Math.max(0, threat.signalStability - 12),
      corruptionPressure: Math.min(100, threat.corruptionPressure + 3),
    },
  }
}

export function pickMemoryDebtWordCount(
  run: DungeonRunContract,
  defaultCount: number
): number {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "memory-debt") return defaultCount
  return defaultCount
}

export function buildMemoryDebtVocabularyEncounter(
  wordCount: number,
  masteryRows?: Map<string, number>
): ReturnType<typeof createVocabularyEncounter> {
  const map = masteryRows ?? getMasteryMap()
  const debtIds: string[] = []
  for (const [wordId, score] of map.entries()) {
    if (score < 45) debtIds.push(wordId)
  }

  if (debtIds.length >= wordCount) {
    const base = createVocabularyEncounter(wordCount * 2)
    const debtSet = new Set(debtIds)
    const prioritized = base.words.filter((w) => debtSet.has(w.id))
    const rest = base.words.filter((w) => !debtSet.has(w.id))
    const merged = [...prioritized, ...rest].slice(0, wordCount)
    if (merged.length >= wordCount) {
      return { ...base, words: merged }
    }
  }

  return createVocabularyEncounter(wordCount)
}

export function applyReflectionWordBias(
  run: DungeonRunContract,
  wordCount: number
): ReturnType<typeof createVocabularyEncounter> {
  const master = resolveMasterForRun(run)
  if (master.uniqueRuleId !== "reflection") {
    return createVocabularyEncounter(wordCount)
  }
  return buildMemoryDebtVocabularyEncounter(wordCount)
}

export function damageBossIntegrityOnCorrect(
  run: DungeonRunContract
): DungeonRunContract {
  const phases = run.dungeon.boss?.phaseSpecs?.length ?? run.dungeon.boss?.phases ?? 2
  const perPhase = 100 / phases
  return {
    ...run,
    bossIntegrity: Math.max(0, (run.bossIntegrity ?? 100) - perPhase),
  }
}

export function restoreBossIntegrityOnWrong(run: DungeonRunContract): DungeonRunContract {
  return {
    ...run,
    bossIntegrity: Math.min(100, (run.bossIntegrity ?? 100) + 5),
  }
}

export function getWeakWordCount(mastery?: Map<string, number>): number {
  const map = mastery ?? getMasteryMap()
  let count = 0
  for (const score of map.values()) {
    if (score < 40) count++
  }
  return count
}

export function isMasterRuleActive(run: DungeonRunContract, ruleId: string): boolean {
  return resolveMasterForRun(run).uniqueRuleId === ruleId
}
