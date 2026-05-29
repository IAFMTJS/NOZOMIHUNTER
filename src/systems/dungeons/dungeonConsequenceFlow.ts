import type { QuestContract } from "@/contracts/quest-contract"
import { isDungeonV2Run } from "./dungeonV2Helpers"
import {
  applyCorrectConsequence,
  applyWrongConsequence,
} from "./dungeonThreatSystem"
import {
  dialogueOnAwarenessTier,
  dialogueOnCorruptionBand,
  dialogueOnFirstMistake,
  dialogueOnStreak,
} from "./dungeonMasterDialogueSystem"
import {
  applyHungerOnStreak,
  applyHungerOnWrong,
  damageBossIntegrityOnCorrect,
  restoreBossIntegrityOnWrong,
} from "./dungeonMasterRuleSystem"
import { patchRun } from "./dungeonQuestPatch"
import { beginBossPhase } from "./dungeonEngagementFlow"

export function applyEncounterAnswerConsequence(
  quest: QuestContract,
  correct: boolean
): QuestContract {
  const run = quest.dungeonRun!
  if (!isDungeonV2Run(run)) return quest

  const streak = quest.vocabularyEncounter?.correctStreak ?? 0
  if (correct) {
    const { run: next } = applyCorrectConsequence(run, streak)
    let patched = damageBossIntegrityOnCorrect(next, streak)
    patched = applyHungerOnStreak(patched, streak)
    patched = dialogueOnStreak(patched, streak)
    patched = dialogueOnAwarenessTier(patched)
    patched = dialogueOnCorruptionBand(patched)
    return patchRun(quest, patched)
  }

  const { run: nextAfterWrong, forceBoss } = applyWrongConsequence(run)
  let next = applyHungerOnWrong(nextAfterWrong)
  next = restoreBossIntegrityOnWrong(next)
  next = dialogueOnFirstMistake(next)
  next = dialogueOnAwarenessTier(next)
  next = dialogueOnCorruptionBand(next)
  let updated = patchRun(quest, next)
  if (forceBoss && updated.dungeonRun?.machineState !== "BOSS") {
    updated = beginBossPhase(updated)
  }
  return updated
}
