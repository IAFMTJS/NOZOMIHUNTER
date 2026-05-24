import type { QuestContract } from "@/contracts/quest-contract"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import { interpretTerminalSign } from "@/systems/quests/terminalBreachSystem"
import {
  stabilizeKanjiTarget,
  isKanjiSurgeryComplete,
} from "@/systems/training/kanjiSurgerySystem"
import { checkMemoryCascadeAnswer } from "@/systems/training/memoryCascadeSystem"
import {
  toggleSemanticLink,
  semanticNetworkComplete,
} from "@/systems/vocabulary/semanticNetworkSystem"
import { canCompleteQuest } from "@/systems/quests/questValidator"

export type GameModeActionResult = {
  quest: QuestContract
  correct?: boolean
  encounterFailed?: boolean
  message?: string
}

export function rebuildQuestForGameMode(quest: QuestContract): QuestContract {
  const mode = resolveQuestGameMode(quest)
  if (mode === "STANDARD") return quest
  return applyGameModeToQuest(quest, mode)
}

export function applyGameModeAction(
  quest: QuestContract,
  action: string,
  payload?: string
): GameModeActionResult {
  const mode = resolveQuestGameMode(quest)

  if (action === "kanji-stabilize" && mode === "KANJI_SURGERY") {
    const [targetId, okRaw] = (payload ?? "").split(":")
    const success = okRaw === "true"
    const targets = (quest.kanjiSurgeryEncounter ?? []).map((t) =>
      t.id === targetId ? stabilizeKanjiTarget(t, success) : t
    )
    const updated: QuestContract = { ...quest, kanjiSurgeryEncounter: targets }
    if (isKanjiSurgeryComplete(targets)) {
      return completeModeObjective(updated, "Kanji seals stabilized.")
    }
    return { quest: updated, correct: success, message: success ? "Seal reinforced." : "Leak detected." }
  }

  if (action === "memory-intruder" && mode === "MEMORY_CASCADE") {
    const round = quest.memoryCascadeEncounter
    if (!round || !payload) return { quest }
    const correct = checkMemoryCascadeAnswer(round, payload)
    if (correct) {
      return completeModeObjective(quest, "Intruder isolated.")
    }
    return {
      quest,
      correct: false,
      message: "Memory chain corrupted.",
    }
  }

  if (action === "terminal-interpret" && mode === "TERMINAL_BREACH") {
    const breach = quest.terminalBreachEncounter
    if (!breach || !payload) return { quest }
    const { correct, encounter } = interpretTerminalSign(breach, payload)
    const updated = { ...quest, terminalBreachEncounter: encounter }
    if (encounter.pathUnlocked) {
      return completeModeObjective(updated, "Sector path unlocked.")
    }
    return {
      quest: updated,
      correct,
      message: correct ? "Interpretation accepted." : "Alarm triggered.",
    }
  }

  if (action === "semantic-link" && mode === "SEMANTIC_NETWORK") {
    const enc = quest.semanticNetworkEncounter
    if (!enc || !payload) return { quest }
    const [fromId, toId] = payload.split(":")
    const matched = toggleSemanticLink(enc.matchedLinkIds, "", fromId!, toId!)
    const updatedEnc = { ...enc, matchedLinkIds: matched }
    const updated = { ...quest, semanticNetworkEncounter: updatedEnc }
    if (semanticNetworkComplete(updatedEnc.links, matched)) {
      return completeModeObjective(updated, "Semantic network complete.")
    }
    return { quest: updated, correct: true, message: "Link recorded." }
  }

  return { quest }
}

function completeModeObjective(
  quest: QuestContract,
  message: string
): GameModeActionResult {
  const objectives = quest.objectives.map((o) => ({
    ...o,
    currentProgress: o.requiredProgress,
    completed: true,
  }))
  const updated = { ...quest, objectives }
  return {
    quest: updated,
    correct: true,
    message,
    encounterFailed: false,
  }
}

export function isGameModeQuestComplete(quest: QuestContract): boolean {
  return canCompleteQuest(quest)
}
