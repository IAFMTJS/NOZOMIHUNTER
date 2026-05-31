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
import {
  applyReflectionWordBias,
  buildMemoryDebtVocabularyEncounter,
  isMasterRuleActive,
} from "./dungeonMasterRuleSystem"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type { RoomType } from "@/contracts/encounter-script-contract"
import { resolveNodeEncounterContent } from "@/config/dungeonEncounterContentConfig"
import {
  resolveListeningFragmentCount,
  resolveWordCount,
} from "@/systems/learning/encounterScaleSystem"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"

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
  dungeonRun?: DungeonRunContract
  nodeId?: string
  dungeonKey?: string
  roomType?: RoomType
  scenarioId?: string
  gameMode?: import("@/contracts/game-mode-contract").GameModeId
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
  const count = ctx?.wordCount ?? DUNGEON_CONFIG.SECTOR_VOCAB_WORDS
  const run = ctx?.dungeonRun
  let enc = createVocabularyEncounter(count)
  if (run && isMasterRuleActive(run, "memory-debt")) {
    enc = buildMemoryDebtVocabularyEncounter(count)
  } else if (run && isMasterRuleActive(run, "reflection")) {
    enc = applyReflectionWordBias(run, count)
  }
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

function scaleContext(ctx?: MountContext): MountContext | undefined {
  if (!ctx) return ctx
  const level = ctx.playerLevel ?? 1
  const danger = ctx.dungeonRun?.routeGraph?.nodes[ctx.nodeId ?? ""]?.danger
  const roomType = ctx.roomType
  const scaleContext =
    roomType === "ELITE" ? "dungeon-elite" : ("dungeon-sector" as const)
  return {
    ...ctx,
    wordCount:
      ctx.wordCount ??
      resolveWordCount({ context: scaleContext, playerLevel: level, danger }),
  }
}

function applyNodeContent(ctx?: MountContext): MountContext | undefined {
  if (!ctx?.dungeonKey || !ctx.nodeId) return scaleContext(ctx)
  const content = resolveNodeEncounterContent(ctx.dungeonKey, ctx.nodeId)
  if (!content) return scaleContext(ctx)
  return scaleContext({
    ...ctx,
    gameMode: content.gameMode ?? ctx.gameMode,
    scenarioId: content.scenarioId ?? ctx.scenarioId,
    roomType: content.roomType ?? ctx.roomType,
  })
}

function wrapWithGameMode(
  payload: MountedEncounterPayload,
  ctx?: MountContext
): MountedEncounterPayload {
  const mode = ctx?.gameMode
  if (!mode || mode === "STANDARD") return payload
  const quest = applyGameModeToQuest(
    {
      id: "dungeon-mode",
      type: "VOCABULARY",
      title: ctx?.sectorLabel ?? "Sector",
      description: "Dungeon mode segment",
      difficulty: "NORMAL",
      rewards: { xp: 0, credits: 0, items: [] },
      objectives: [],
      gameMode: mode,
    },
    mode
  )
  return {
    activeType: payload.activeType,
    vocabularyEncounter: quest.vocabularyEncounter ?? payload.vocabularyEncounter,
    listeningEncounter: quest.listeningEncounter ?? payload.listeningEncounter,
    conversationEncounter:
      quest.conversationEncounter ?? payload.conversationEncounter,
    speechEncounter: quest.speechEncounter ?? payload.speechEncounter,
  }
}

export function mountSectorEncounter(
  type: EncounterType,
  sectorLabel: string,
  ctx?: MountContext
): MountedEncounterPayload {
  const label = ctx?.sectorLabel ?? sectorLabel
  const resolved = applyNodeContent(ctx)
  const scenarioId = resolved?.scenarioId ?? "gate-check"
  switch (type) {
    case "VOCAB":
      return wrapWithGameMode(
        {
          activeType: "VOCAB",
          vocabularyEncounter: applyCombatToVocabulary(
            {} as QuestContract,
            resolved
          ),
        },
        resolved
      )
    case "LISTENING":
      return wrapWithGameMode(
        {
          activeType: "LISTENING",
          listeningEncounter: createListeningEncounter(
            resolveListeningFragmentCount(resolved?.playerLevel ?? 1),
            resolved?.sectorLabel
              ? `Sector ${label}: decode the transmission. Match romaji, kana, or English.`
              : `Sector ${label}: decode the transmission. Match romaji, kana, or English.`
          ),
        },
        resolved
      )
    case "NPC":
      return wrapWithGameMode(
        {
          activeType: "NPC",
          conversationEncounter: createConversationEncounter(scenarioId, 2),
        },
        resolved
      )
    case "SPEECH":
      return wrapWithGameMode(
        {
          activeType: "SPEECH",
          speechEncounter: createSpeechEncounter(scenarioId),
        },
        resolved
      )
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
