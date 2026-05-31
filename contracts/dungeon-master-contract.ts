import type { DungeonBossPhaseSpec } from "./dungeon-contract"
import type { DungeonModifierContract } from "./game-mode-contract"

export type DungeonMasterId =
  | "neon-warden"
  | "archivist"
  | "broadcast-spirit"
  | "gate-devourer"
  | "mirror-hunter"
  | "collapse-echo"
  | "void-stalker"
  | "shrine-warden"
  | "hollow-monk"

export type MasterRelationshipState =
  | "UNKNOWN"
  | "OBSERVING"
  | "PROVOKED"
  | "RIVAL"
  | "BROKEN"
  | "BOUND"

export type MasterDialogueMoment =
  | "ENTRY"
  | "ROUTE_CHOICE"
  | "FIRST_MISTAKE"
  | "STREAK"
  | "CORRUPTION"
  | "BOSS_AWARENESS"
  | "BOSS_PHASE"
  | "EXTRACTION"
  | "FAILURE"
  | "PERFECT_CLEAR"
  | "REMATCH"

export type MasterAwarenessTier = 0 | 25 | 50 | 75 | 100

export interface MasterVisualProfile {
  cssClass: string
  palette: string[]
  motionClass: string
  collapseId: string
}

export interface MasterPerfectClearReward {
  title: string
  relicKey: string
  techniqueLabel: string
}

export interface DungeonMasterDefinition {
  id: DungeonMasterId
  displayName: string
  domainLabel: string
  crestGlyph: string
  personalityTags: string[]
  masteryFocus: string[]
  uniqueRuleId: string
  uniqueRuleSummary: string
  pressureStyle: string
  perfectClearReward: MasterPerfectClearReward
  dialoguePools: Partial<Record<MasterDialogueMoment, string[]>>
  bossPattern: DungeonBossPhaseSpec[] | "inherit-definition"
  rematchModifiers?: Partial<
    Record<MasterRelationshipState, Omit<DungeonModifierContract, "id">>
  >
  visualProfile: MasterVisualProfile
}

export interface MasterDialogueResult {
  line: string
  moment: MasterDialogueMoment
  suppressMs?: number
}

export interface MasterPresenceView {
  masterId: DungeonMasterId
  displayName: string
  crestGlyph: string
  domainLabel: string
  awarenessTier: MasterAwarenessTier
  dialogueLine: string | null
  cssClass: string
  presenceClass: string
}

export interface MasterDialogueContext {
  moment: MasterDialogueMoment
  masterId: DungeonMasterId
  streak?: number
  encounterFailures?: number
  corruptionPressure?: number
  bossAwareness?: number
  relationshipState?: MasterRelationshipState
  weakWordCount?: number
  phaseIndex?: number
  phaseLabel?: string
  seed?: string
}
