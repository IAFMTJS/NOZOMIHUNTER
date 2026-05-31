import type { GameModeId } from "@/contracts/game-mode-contract"
import type { EncounterScriptContract } from "@/contracts/encounter-script-contract"

export const ENCOUNTER_SCRIPTS: EncounterScriptContract[] = [
  {
    id: "neon-hall-vocab",
    dungeonKey: "dungeon:neon-corridor",
    nodeId: "neon-hall",
    roomType: "COMBAT",
    gameMode: "TERMINAL_BREACH",
    briefing: "Neon Hall — terminal breach protocol. Decode labels under gate pressure.",
    phases: [
      { type: "ENVIRONMENT_SCAN", label: "Scanning neon signage…" },
      { type: "MODE_SEGMENT", gameMode: "TERMINAL_BREACH", wordCount: 3 },
    ],
  },
  {
    id: "archive-door-listen",
    dungeonKey: "dungeon:neon-corridor",
    nodeId: "archive-door",
    roomType: "ELITE",
    gameMode: "LOST_TRANSMISSION",
    briefing: "Archive door — lost transmission fragments behind static.",
    phases: [
      { type: "ENVIRONMENT_SCAN", label: "Signal distortion rising…" },
      { type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 2 },
    ],
  },
  {
    id: "signal-hall-npc",
    dungeonKey: "dungeon:neon-corridor",
    nodeId: "signal-hall",
    roomType: "COMBAT",
    gameMode: "GHOST_INTERROGATION",
    briefing: "Signal hall — ghost interrogation under trust decay.",
    phases: [
      { type: "NPC_BRANCH", scenarioId: "signal-relay", label: "Hostile relay" },
      { type: "MODE_SEGMENT", gameMode: "GHOST_INTERROGATION" },
    ],
  },
  {
    id: "listening-vault",
    dungeonKey: "dungeon:shadow-archive",
    nodeId: "listening-vault",
    roomType: "COMBAT",
    gameMode: "LOST_TRANSMISSION",
    phases: [
      { type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 2 },
    ],
  },
  {
    id: "lexicon-stack",
    dungeonKey: "dungeon:shadow-archive",
    nodeId: "lexicon-stack",
    roomType: "ELITE",
    gameMode: "MEMORY_CASCADE",
    phases: [
      { type: "MODE_SEGMENT", gameMode: "MEMORY_CASCADE", wordCount: 4 },
    ],
  },
  {
    id: "memory-hall-npc",
    dungeonKey: "dungeon:shadow-archive",
    nodeId: "memory-hall",
    gameMode: "DEEP_COVER",
    phases: [
      { type: "MODE_SEGMENT", gameMode: "DEEP_COVER", scenarioId: "shadow-briefing" },
    ],
  },
  {
    id: "abyss-vocab",
    dungeonKey: "dungeon:abyss-core",
    nodeId: "vocab",
    gameMode: "SURVIVAL_VOCAB",
    phases: [{ type: "MODE_SEGMENT", gameMode: "SURVIVAL_VOCAB", wordCount: 4 }],
  },
  {
    id: "void-listen",
    dungeonKey: "dungeon:void-pursuit",
    nodeId: "listen",
    gameMode: "LOST_TRANSMISSION",
    phases: [{ type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 3 }],
  },
  {
    id: "rogue-speech",
    dungeonKey: "dungeon:roguelike-sector",
    nodeId: "speech",
    gameMode: "SHADOW_ECHO",
    phases: [{ type: "MODE_SEGMENT", gameMode: "SHADOW_ECHO" }],
  },
  {
    id: "story-rest-shrine",
    dungeonKey: "dungeon:neon-corridor",
    nodeId: "recovery-alcove",
    roomType: "RECOVERY",
    briefing: "Recovery alcove — sector pressure eases.",
    phases: [{ type: "STORY_BEAT", label: "Stabilization pulse" }],
  },
  {
    id: "story-whisper",
    dungeonKey: "dungeon:shadow-archive",
    nodeId: "story-fragment",
    roomType: "STORY",
    storyBeatId: "beat-s01-019",
    phases: [
      {
        type: "STORY_BEAT",
        label: "Archive whisper — partial decode",
        scenarioId: "shadow-briefing",
      },
    ],
  },
]

const BY_ID = new Map(ENCOUNTER_SCRIPTS.map((s) => [s.id, s]))

export function getEncounterScriptById(
  id: string
): EncounterScriptContract | null {
  return BY_ID.get(id) ?? null
}

export function resolveEncounterScript(
  dungeonKey: string,
  nodeId: string,
  scriptId?: string
): EncounterScriptContract | null {
  if (scriptId) {
    const explicit = BY_ID.get(scriptId)
    if (explicit) return explicit
  }
  return (
    ENCOUNTER_SCRIPTS.find(
      (s) => s.dungeonKey === dungeonKey && s.nodeId === nodeId
    ) ?? null
  )
}

export function primaryGameModeFromScript(
  script: EncounterScriptContract
): GameModeId | undefined {
  if (script.gameMode) return script.gameMode
  for (const phase of script.phases) {
    if (phase.gameMode) return phase.gameMode
  }
  return undefined
}
