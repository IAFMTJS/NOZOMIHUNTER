import type { GameModeId } from "@/contracts/game-mode-contract"
import type { EncounterType } from "@/contracts/dungeon-contract"
import type {
  EncounterScriptContract,
  EncounterPhaseContract,
  RoomType,
} from "@/contracts/encounter-script-contract"
import {
  getEncounterScriptById,
  primaryGameModeFromScript,
  resolveEncounterScript,
} from "@/config/encounterScriptsConfig"
import type {
  MountContext,
  MountedEncounterPayload,
} from "@/systems/dungeons/dungeonEncounterFactory"
import { mountSectorEncounter } from "@/systems/dungeons/dungeonEncounterFactory"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  resolveListeningFragmentCount,
  resolveWordCount,
} from "@/systems/learning/encounterScaleSystem"

export type EncounterScriptMountKind =
  | "COMBAT"
  | "STORY"
  | "RECOVERY"
  | "TREASURE"
  | "SKIP"

export interface EncounterScriptMountResult {
  kind: EncounterScriptMountKind
  payload?: MountedEncounterPayload
  gameMode?: GameModeId
  briefing?: string
  storyCopy?: string
}

const MODE_TO_ENCOUNTER: Partial<Record<GameModeId, EncounterType>> = {
  TERMINAL_BREACH: "VOCAB",
  SURVIVAL_VOCAB: "VOCAB",
  MEMORY_CASCADE: "VOCAB",
  ENTITY_HUNT: "VOCAB",
  LOST_TRANSMISSION: "LISTENING",
  ECHO_LISTENING: "LISTENING",
  GHOST_INTERROGATION: "NPC",
  DEEP_COVER: "NPC",
  SHADOW_ECHO: "SPEECH",
  KANJI_SURGERY: "VOCAB",
}

function activePhase(script: EncounterScriptContract): EncounterPhaseContract {
  return (
    script.phases.find(
      (p) =>
        p.type === "MODE_SEGMENT" ||
        p.type === "VOCAB_LOCK" ||
        p.type === "LISTEN_DECODE" ||
        p.type === "SPEECH_LOCK" ||
        p.type === "NPC_BRANCH"
    ) ?? script.phases[0]!
  )
}

function encounterTypeForMode(mode: GameModeId): EncounterType {
  return MODE_TO_ENCOUNTER[mode] ?? "VOCAB"
}

function buildModeQuest(
  mode: GameModeId,
  briefing?: string
): QuestContract {
  const base: QuestContract = {
    id: "script-mount",
    type: "VOCABULARY",
    title: "Sector breach",
    description: briefing ?? "Encounter script segment",
    difficulty: "NORMAL",
    rewards: { xp: 0, credits: 0, items: [] },
    objectives: [],
    gameMode: mode,
  }
  return applyGameModeToQuest(base, mode)
}

export function resolveScriptForNode(
  dungeonKey: string,
  nodeId: string,
  scriptId?: string
): EncounterScriptContract | null {
  return resolveEncounterScript(dungeonKey, nodeId, scriptId)
}

export function mountFromEncounterScript(
  script: EncounterScriptContract,
  ctx: MountContext & { nodeId?: string; roomType?: RoomType }
): EncounterScriptMountResult {
  const roomType = ctx.roomType ?? script.roomType

  if (roomType === "RECOVERY") {
    return {
      kind: "RECOVERY",
      briefing: script.briefing ?? "Recovery alcove — pressure eases.",
      storyCopy: script.phases[0]?.label,
    }
  }

  if (roomType === "STORY" || script.phases.every((p) => p.type === "STORY_BEAT")) {
    return {
      kind: "STORY",
      briefing: script.briefing,
      storyCopy: script.phases.map((p) => p.label).filter(Boolean).join(" — "),
    }
  }

  if (roomType === "TREASURE") {
    return { kind: "TREASURE", briefing: script.briefing ?? "Relic cache detected." }
  }

  const mode =
    primaryGameModeFromScript(script) ??
    activePhase(script).gameMode ??
    "STANDARD"
  const phase = activePhase(script)
  const encounterType = encounterTypeForMode(mode)
  const level = ctx.playerLevel ?? 1
  const danger = ctx.dungeonRun?.routeGraph?.nodes[ctx.nodeId ?? ""]?.danger

  const scaledCtx: MountContext = {
    ...ctx,
    wordCount:
      phase.wordCount ??
      resolveWordCount({
        context: roomType === "ELITE" ? "dungeon-elite" : "dungeon-sector",
        playerLevel: level,
        danger,
      }),
  }

  let payload = mountSectorEncounter(encounterType, ctx.sectorLabel, scaledCtx)

  if (mode !== "STANDARD") {
    const modeQuest = buildModeQuest(mode, script.briefing)
    payload = {
      activeType: payload.activeType,
      vocabularyEncounter:
        modeQuest.vocabularyEncounter ?? payload.vocabularyEncounter,
      listeningEncounter:
        modeQuest.listeningEncounter ?? payload.listeningEncounter,
      conversationEncounter:
        modeQuest.conversationEncounter ?? payload.conversationEncounter,
      speechEncounter: modeQuest.speechEncounter ?? payload.speechEncounter,
    }
  }

  return {
    kind: "COMBAT",
    payload,
    gameMode: mode,
    briefing: script.briefing,
  }
}

export function loadEncounterScript(id: string): EncounterScriptContract | null {
  return getEncounterScriptById(id)
}

export function resolveListeningCountFromScript(
  script: EncounterScriptContract,
  playerLevel: number
): number {
  const phase = activePhase(script)
  return resolveListeningFragmentCount(playerLevel, phase.fragmentCount)
}
