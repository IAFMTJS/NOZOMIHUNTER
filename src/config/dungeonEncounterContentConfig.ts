import type { GameModeId } from "@/contracts/game-mode-contract"
import type { RoomType } from "@/contracts/encounter-script-contract"

export interface NodeEncounterContent {
  gameMode?: GameModeId
  scenarioId?: string
  encounterScriptId?: string
  briefing?: string
  wordPoolRef?: string
  roomType?: RoomType
}

type NodeKey = `${string}::${string}`

const NODE_CONTENT: Record<NodeKey, NodeEncounterContent> = {
  "dungeon:neon-corridor::neon-hall": {
    gameMode: "TERMINAL_BREACH",
    encounterScriptId: "neon-hall-vocab",
    briefing: "Neon Hall — terminal breach under gate pressure.",
    wordPoolRef: "sector-02-listening",
    roomType: "COMBAT",
  },
  "dungeon:neon-corridor::archive-door": {
    gameMode: "LOST_TRANSMISSION",
    encounterScriptId: "archive-door-listen",
    briefing: "Archive door — kanji lock with static fragments.",
    roomType: "ELITE",
  },
  "dungeon:neon-corridor::signal-hall": {
    gameMode: "GHOST_INTERROGATION",
    encounterScriptId: "signal-hall-npc",
    scenarioId: "signal-relay",
    roomType: "COMBAT",
  },
  "dungeon:neon-corridor::broken-shrine": {
    gameMode: "SHADOW_ECHO",
    scenarioId: "signal-relay",
    briefing: "Broken shrine — voice imprint under timing pressure.",
    roomType: "COMBAT",
  },
  "dungeon:neon-corridor::recovery-alcove": {
    encounterScriptId: "story-rest-shrine",
    roomType: "RECOVERY",
    briefing: "Recovery alcove — corruption pressure eases.",
  },
  "dungeon:neon-corridor::relic-cache": {
    roomType: "TREASURE",
    briefing: "Relic cache — warden access shard detected.",
  },
  "dungeon:shadow-archive::listening-vault": {
    gameMode: "LOST_TRANSMISSION",
    encounterScriptId: "listening-vault",
    wordPoolRef: "sector-03-n4-vocab",
  },
  "dungeon:shadow-archive::lexicon-stack": {
    gameMode: "MEMORY_CASCADE",
    encounterScriptId: "lexicon-stack",
    roomType: "ELITE",
  },
  "dungeon:shadow-archive::memory-hall": {
    gameMode: "DEEP_COVER",
    encounterScriptId: "memory-hall-npc",
    scenarioId: "shadow-briefing",
  },
  "dungeon:shadow-archive::story-fragment": {
    encounterScriptId: "story-whisper",
    roomType: "STORY",
    briefing: "Archive whisper — partial decode required.",
  },
  "dungeon:abyss-core::vocab": {
    gameMode: "SURVIVAL_VOCAB",
    encounterScriptId: "abyss-vocab",
    roomType: "ELITE",
  },
  "dungeon:abyss-core::listen": {
    gameMode: "LOST_TRANSMISSION",
    briefing: "Deep signal — repair corrupted readings.",
  },
  "dungeon:corruption-run::vocab": {
    gameMode: "SURVIVAL_VOCAB",
    roomType: "COMBAT",
  },
  "dungeon:void-pursuit::listen": {
    gameMode: "LOST_TRANSMISSION",
    encounterScriptId: "void-listen",
  },
  "dungeon:roguelike-sector::speech": {
    gameMode: "SHADOW_ECHO",
    encounterScriptId: "rogue-speech",
  },
}

function nodeKey(dungeonKey: string, nodeId: string): NodeKey {
  return `${dungeonKey}::${nodeId}` as NodeKey
}

export function resolveNodeEncounterContent(
  dungeonKey: string,
  nodeId: string
): NodeEncounterContent | null {
  return NODE_CONTENT[nodeKey(dungeonKey, nodeId)] ?? null
}
