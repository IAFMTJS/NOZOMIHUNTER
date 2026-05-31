import type { QuestContract } from "@/contracts/quest-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { createSpeechEncounter } from "@/systems/quests/speechEncounterSystem"
import { createConversationEncounter } from "@/systems/quests/conversationEncounterSystem"
import { createTerminalBreachEncounter } from "@/systems/quests/terminalBreachSystem"
import { createKanjiSurgeryTargets } from "@/systems/training/kanjiSurgerySystem"
import { createMemoryCascadeRound } from "@/systems/training/memoryCascadeSystem"
import { createKanaDashEncounter } from "@/systems/training/kanaDashSystem"
import {
  createEchoListeningEncounter,
  createEchoListeningRound,
} from "@/systems/training/echoListeningSystem"
import { createShadowTypingEncounter } from "@/systems/training/shadowTypingSystem"
import { createMemoryGridRound } from "@/systems/training/memoryGridSystem"
import { createSurvivalVocabEncounter } from "@/systems/training/survivalVocabSystem"
import { createSemanticNetworkEncounter } from "@/systems/vocabulary/semanticNetworkSystem"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"

export function applyGameModeToQuest(
  quest: QuestContract,
  modeId: GameModeId
): QuestContract {
  switch (modeId) {
    case "SIGNAL_CALIBRATION": {
      const encounter = createListeningEncounter(
        3,
        "Signal calibration: isolate channels and reconstruct transmission order."
      )
      return {
        ...quest,
        gameMode: modeId,
        type: "LISTENING",
        listeningEncounter: { ...encounter, replayBudget: 5, channelIsolated: false },
      }
    }
    case "LOST_TRANSMISSION": {
      const encounter = createListeningEncounter(
        LISTENING_QUEST_CONFIG.DEFAULT_FRAGMENT_COUNT + 1,
        "Lost transmission: replay clips and tag keywords to rebuild the timeline."
      )
      return {
        ...quest,
        gameMode: modeId,
        type: "LISTENING",
        listeningEncounter: {
          ...encounter,
          replayBudget: 8,
          timelineKeywords: encounter.fragments.map((f) => f.romaji),
          taggedKeywords: [],
        },
      }
    }
    case "SHADOW_ECHO": {
      const encounter = createSpeechEncounter("signal-relay")
      return {
        ...quest,
        gameMode: modeId,
        type: "SPEECH",
        title: quest.title || "Shadow Echo",
        speechEncounter: encounter,
      }
    }
    case "GHOST_INTERROGATION":
    case "DEEP_COVER":
    case "PANIC_CHANNEL": {
      const scenarioId =
        modeId === "PANIC_CHANNEL" ? "shadow-briefing" : "gate-check"
      const encounter = createConversationEncounter(scenarioId)
      return {
        ...quest,
        gameMode: modeId,
        type: "CONVERSATION",
        conversationEncounter: {
          ...encounter,
          clueState: [],
          panicMode: modeId === "PANIC_CHANNEL",
          panicSecondsRemaining: modeId === "PANIC_CHANNEL" ? 30 : undefined,
          relationshipTrust: modeId === "DEEP_COVER" ? 50 : undefined,
        },
      }
    }
    case "TERMINAL_BREACH":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        terminalBreachEncounter: createTerminalBreachEncounter(),
      }
    case "KANJI_SURGERY":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        kanjiSurgeryEncounter: createKanjiSurgeryTargets(3),
      }
    case "MEMORY_CASCADE":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        memoryCascadeEncounter: createMemoryCascadeRound(),
      }
    case "KANA_DASH":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        title: quest.title || "Kana Dash",
        vocabularyEncounter: createKanaDashEncounter(),
      }
    case "ECHO_LISTENING":
      return {
        ...quest,
        gameMode: modeId,
        type: "LISTENING",
        title: quest.title || "Echo Listening",
        listeningEncounter: createEchoListeningEncounter(),
        echoListeningEncounter: createEchoListeningRound(),
      }
    case "SHADOW_TYPING":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        title: quest.title || "Shadow Typing",
        vocabularyEncounter: createShadowTypingEncounter(),
      }
    case "MEMORY_GRID":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        title: quest.title || "Memory Grid",
        memoryGridEncounter: createMemoryGridRound(),
      }
    case "SURVIVAL_VOCAB":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        title: quest.title || "Vocab Sprint",
        vocabularyEncounter: createSurvivalVocabEncounter(),
      }
    case "SEMANTIC_NETWORK":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        semanticNetworkEncounter: createSemanticNetworkEncounter(),
      }
    case "ENTITY_HUNT":
      return {
        ...quest,
        gameMode: modeId,
        type: "VOCABULARY",
        vocabularyEncounter: createVocabularyEncounter(4),
      }
  }
  return { ...quest, gameMode: modeId }
}
