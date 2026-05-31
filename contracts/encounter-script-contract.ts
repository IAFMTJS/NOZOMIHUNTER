import type { GameModeId } from "./game-mode-contract"
import type { StoryBeatId } from "./narrative-contract"

export type RoomType =
  | "COMBAT"
  | "ELITE"
  | "PUZZLE"
  | "STORY"
  | "RECOVERY"
  | "TREASURE"
  | "BOSS"

export type EncounterPhaseKind =
  | "ENVIRONMENT_SCAN"
  | "VOCAB_LOCK"
  | "LISTEN_DECODE"
  | "SPEECH_LOCK"
  | "NPC_BRANCH"
  | "MODE_SEGMENT"
  | "STORY_BEAT"
  | "BRANCH"

export interface EncounterPhaseContract {
  type: EncounterPhaseKind
  label?: string
  wordCount?: number
  fragmentCount?: number
  signCount?: number
  scenarioId?: string
  gameMode?: GameModeId
  wordPoolRef?: string
  storyBeatId?: StoryBeatId
  choices?: { id: string; label: string; exitId?: string }[]
  failAlarm?: boolean
  durationTargetSec?: number
}

export interface EncounterScriptContract {
  id: string
  sectorId?: string
  dungeonKey?: string
  nodeId?: string
  roomType?: RoomType
  gameMode?: GameModeId
  durationTargetSec?: number
  briefing?: string
  storyBeatId?: StoryBeatId
  phases: EncounterPhaseContract[]
}
