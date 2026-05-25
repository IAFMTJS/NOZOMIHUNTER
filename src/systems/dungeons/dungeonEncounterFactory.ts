import type {
  DungeonAction,
  DungeonBossPhaseSpec,
  EncounterType,
} from "@/contracts/dungeon-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ChallengePromptDirection } from "@/contracts/encounter-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { createConversationEncounter } from "@/systems/quests/conversationEncounterSystem"
import { createSpeechEncounter } from "@/systems/quests/speechEncounterSystem"
import { createListeningEncounter } from "./listeningEncounterSystem"
import { attachChallengeFields } from "@/systems/learning/challengeDisplaySystem"
import {
  defaultActionForLevel,
  resolveActionToDirection,
  unlockedActionsForLevel,
} from "./dungeonActionSystem"

export interface MountedEncounterPayload {
  activeType: EncounterType | "BOSS"
  vocabularyEncounter?: QuestContract["vocabularyEncounter"]
  conversationEncounter?: QuestContract["conversationEncounter"]
  speechEncounter?: QuestContract["speechEncounter"]
  listeningEncounter?: QuestContract["listeningEncounter"]
}

export interface MountContext {
  sectorLabel: string
  playerLevel?: number
  selectedAction?: DungeonAction
  challengeDirection?: ChallengePromptDirection
  wordCount?: number
}

export interface BossMountOptions {
  phaseSpec?: DungeonBossPhaseSpec
  sectorLabel?: string
  forceListening?: boolean
  forceSpeech?: boolean
  forceNpc?: boolean
}

function applyCombatToVocabulary(
  quest: QuestContract,
  ctx?: MountContext
): QuestContract["vocabularyEncounter"] {
  const enc = createVocabularyEncounter(
    ctx?.wordCount ?? DUNGEON_CONFIG.SECTOR_VOCAB_WORDS
  )
  const level = ctx?.playerLevel ?? 1
  const action = ctx?.selectedAction ?? defaultActionForLevel(level)
  const direction =
    ctx?.challengeDirection ?? resolveActionToDirection(action)
  const allowed = unlockedActionsForLevel(level)

  return {
    ...enc,
    words: enc.words.map((w) => ({
      ...attachChallengeFields(w, 50, direction),
      allowedDungeonActions: allowed,
    })),
  }
}

export function mountSectorEncounter(
  type: EncounterType,
  sectorLabel: string,
  ctx?: MountContext
): MountedEncounterPayload {
  const label = ctx?.sectorLabel ?? sectorLabel
  switch (type) {
    case "VOCAB":
      return {
        activeType: "VOCAB",
        vocabularyEncounter: applyCombatToVocabulary(
          {} as QuestContract,
          ctx
        ),
      }
    case "LISTENING":
      return {
        activeType: "LISTENING",
        listeningEncounter: createListeningEncounter(
          DUNGEON_CONFIG.LISTENING_FRAGMENT_COUNT,
          `Sector ${label}: decode the transmission. Match romaji, kana, or English.`
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

export function mountBossEncounter(
  phase: number,
  options?: BossMountOptions
): MountedEncounterPayload {
  const spec = options?.phaseSpec
  const label = options?.sectorLabel ?? "Warden"

  if (options?.forceListening || spec?.encounterKind === "LISTENING") {
    return {
      activeType: "BOSS",
      listeningEncounter: createListeningEncounter(
        spec?.fragmentCount ?? DUNGEON_CONFIG.LISTENING_FRAGMENT_COUNT,
        `${label}: repair corrupted readings.`
      ),
    }
  }

  if (options?.forceSpeech || spec?.encounterKind === "SPEECH") {
    return {
      activeType: "BOSS",
      speechEncounter: createSpeechEncounter(DUNGEON_CONFIG.BOSS_SPEECH_SCENARIO),
    }
  }

  if (options?.forceNpc || spec?.encounterKind === "NPC") {
    return {
      activeType: "BOSS",
      conversationEncounter: createConversationEncounter("gate-check", 3),
    }
  }

  if (phase === 0 || spec?.encounterKind === "VOCAB") {
    return {
      activeType: "BOSS",
      vocabularyEncounter: applyCombatToVocabulary({} as QuestContract, {
        sectorLabel: label,
        wordCount: spec?.wordCount ?? DUNGEON_CONFIG.BOSS_VOCAB_WORDS,
      }),
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
