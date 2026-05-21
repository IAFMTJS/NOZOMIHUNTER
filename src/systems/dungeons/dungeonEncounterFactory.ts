import type { EncounterType } from "@/contracts/dungeon-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { createConversationEncounter } from "@/systems/quests/conversationEncounterSystem"
import { createSpeechEncounter } from "@/systems/quests/speechEncounterSystem"
import { createListeningEncounter } from "./listeningEncounterSystem"

export interface MountedEncounterPayload {
  activeType: EncounterType | "BOSS"
  vocabularyEncounter?: QuestContract["vocabularyEncounter"]
  conversationEncounter?: QuestContract["conversationEncounter"]
  speechEncounter?: QuestContract["speechEncounter"]
  listeningEncounter?: QuestContract["listeningEncounter"]
}

export function mountSectorEncounter(
  type: EncounterType,
  sectorLabel: string
): MountedEncounterPayload {
  switch (type) {
    case "VOCAB":
      return {
        activeType: "VOCAB",
        vocabularyEncounter: createVocabularyEncounter(
          DUNGEON_CONFIG.SECTOR_VOCAB_WORDS
        ),
      }
    case "LISTENING":
      return {
        activeType: "LISTENING",
        listeningEncounter: createListeningEncounter(
          DUNGEON_CONFIG.LISTENING_FRAGMENT_COUNT,
          `Sector ${sectorLabel}: decode the transmission. Match romaji, kana, or English.`
        ),
      }
    case "NPC":
      return {
        activeType: "NPC",
        conversationEncounter: createConversationEncounter("gate-check", 2),
      }
    case "SPEECH":
      return {
        activeType: "SPEECH",
        speechEncounter: createSpeechEncounter("gate-check"),
      }
    default:
      throw new Error(`Unsupported sector encounter: ${type}`)
  }
}

export function mountBossEncounter(phase: number): MountedEncounterPayload {
  if (phase === 0) {
    return {
      activeType: "BOSS",
      vocabularyEncounter: createVocabularyEncounter(
        DUNGEON_CONFIG.BOSS_VOCAB_WORDS
      ),
    }
  }
  return {
    activeType: "BOSS",
    speechEncounter: createSpeechEncounter(DUNGEON_CONFIG.BOSS_SPEECH_SCENARIO),
  }
}

export function clearEncounterPayloads(): Pick<
  QuestContract,
  | "vocabularyEncounter"
  | "conversationEncounter"
  | "speechEncounter"
  | "listeningEncounter"
> {
  return {
    vocabularyEncounter: undefined,
    conversationEncounter: undefined,
    speechEncounter: undefined,
    listeningEncounter: undefined,
  }
}
