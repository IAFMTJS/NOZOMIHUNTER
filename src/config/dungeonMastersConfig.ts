import type {
  DungeonMasterDefinition,
  DungeonMasterId,
  MasterDialogueMoment,
} from "@/contracts/dungeon-master-contract"

const BANNED_DIALOGUE_PHRASES = [
  "good job",
  "try again to improve",
  "correctly",
  "great job",
] as const

export function isBannedDialogueLine(line: string): boolean {
  const lower = line.toLowerCase()
  return BANNED_DIALOGUE_PHRASES.some((p) => lower.includes(p))
}

function pool(lines: string[]): string[] {
  return lines.filter((l) => !isBannedDialogueLine(l))
}

const NEON_WARDEN: DungeonMasterDefinition = {
  id: "neon-warden",
  displayName: "The Neon Warden",
  domainLabel: "Neon Corridor",
  crestGlyph: "⛨",
  personalityTags: ["cold", "direct", "military"],
  masteryFocus: ["N5/N4 vocabulary", "quick meaning recall", "kana reading", "signs and labels"],
  uniqueRuleId: "gate-protocol",
  uniqueRuleSummary: "Correct answers open safe routes. Errors open shortcuts with more corruption.",
  pressureStyle: "Gate locks and access denial",
  perfectClearReward: {
    title: "Gatebreaker",
    relicKey: "warden-access-core",
    techniqueLabel: "Precision Seal",
  },
  dialoguePools: {
    ENTRY: pool([
      "ACCESS DENIED — until you prove reading.",
      "You crossed into my corridor. Identify yourself by meaning.",
      "HUNTER SIGNATURE UNSTABLE. Begin gate protocol.",
    ]),
    ROUTE_CHOICE: pool(["Choose your vector. Wrong reading opens the corrupt lane."]),
    FIRST_MISTAKE: pool(["READING MISMATCH.", "ACCESS DENIED.", "Gate sealed. Corruption routing enabled."]),
    STREAK: pool(["Clearance streak logged.", "Three locks broken. Proceed."]),
    CORRUPTION: pool(["Corruption routing active.", "Sector integrity failing."]),
    BOSS_AWARENESS: pool([
      "Boss trace detected — distant whisper on the channel.",
      "Warden proximity rising.",
      "Forced warden encounter — no retreat lane.",
    ]),
    BOSS_PHASE: pool(["Meaning Gate. Reading Gate. Kanji Gate — break them in order."]),
    EXTRACTION: pool(["Extract or breach deeper. I am watching both choices."]),
    FAILURE: pool(["HUNTER SIGNATURE UNSTABLE. Corridor rejects you."]),
    PERFECT_CLEAR: pool(["All gates cleared. Access core yours — for now."]),
    REMATCH: pool(["Return for timed gate chains. I will not hold the locks."]),
  },
  bossPattern: "inherit-definition",
  visualProfile: {
    cssClass: "nozomi-master--neon-warden",
    palette: ["black", "electric-purple", "cyan", "warning-amber"],
    motionClass: "nozomi-master-motion--scan",
    collapseId: "warden-shards",
  },
}

const ARCHIVIST: DungeonMasterDefinition = {
  id: "archivist",
  displayName: "The Archivist",
  domainLabel: "Shadow Archive",
  crestGlyph: "卷",
  personalityTags: ["calm", "contemptuous", "intellectual"],
  masteryFocus: ["kanji recognition", "memory recall", "semantic grouping", "weak-word remediation"],
  uniqueRuleId: "memory-debt",
  uniqueRuleSummary: "Words you missed before return as cursed entries.",
  pressureStyle: "Hidden readings and distorted recall",
  perfectClearReward: {
    title: "Archive Breaker",
    relicKey: "forgotten-index",
    techniqueLabel: "Memory Counter",
  },
  dialoguePools: {
    ENTRY: pool([
      "You have seen these words before. Recognition is not mastery.",
      "Open the archive again — if you dare.",
      "I already indexed your failures.",
    ]),
    ROUTE_CHOICE: pool(["Every shelf you choose remembers your last mistake."]),
    FIRST_MISTAKE: pool([
      "You have seen this word before.",
      "Recognition is not mastery.",
      "That word remembers you.",
    ]),
    STREAK: pool(["Temporary recall. The archive is not impressed."]),
    CORRUPTION: pool(["Ink static thickens. Forgotten entries stir."]),
    BOSS_AWARENESS: pool([
      "The Archivist watches from the stacks.",
      "Memory trial imminent.",
      "Forgotten reading phase approaching.",
    ]),
    BOSS_PHASE: pool([
      "Phase: Forgotten Reading.",
      "Recall. Repair. Identify the intruder. Seal.",
    ]),
    EXTRACTION: pool(["Leave with what you bound — or stay for the trial."]),
    FAILURE: pool(["The archive keeps your mistakes."]),
    PERFECT_CLEAR: pool(["Pages burn into clean word cores. You may go."]),
    REMATCH: pool(["No romaji in phase two this time."]),
  },
  bossPattern: "inherit-definition",
  visualProfile: {
    cssClass: "nozomi-master--archivist",
    palette: ["black", "deep-violet", "aged-gold", "ghost-white"],
    motionClass: "nozomi-master-motion--drift",
    collapseId: "archive-pages",
  },
}

const BROADCAST_SPIRIT: DungeonMasterDefinition = {
  id: "broadcast-spirit",
  displayName: "The Broadcast Spirit",
  domainLabel: "Static Shrine",
  crestGlyph: "📻",
  personalityTags: ["melancholic", "cryptic", "distorted"],
  masteryFocus: ["listening", "kana reconstruction", "sentence fragments", "audio confidence"],
  uniqueRuleId: "signal-decay",
  uniqueRuleSummary: "Each replay lowers signal stability. Low stability spawns false fragments.",
  pressureStyle: "Echo and half-sentences through static",
  perfectClearReward: {
    title: "Signal Listener",
    relicKey: "static-omamori",
    techniqueLabel: "Echo Stabilizer",
  },
  dialoguePools: {
    ENTRY: pool(["Can you still hear me?", "The word is there — behind the noise."]),
    FIRST_MISTAKE: pool(["Do not trust the echo.", "That was not my voice."]),
    STREAK: pool(["The signal accepted your voice."]),
    CORRUPTION: pool(["Static eats the channel.", "Replay tax applied."]),
    BOSS_AWARENESS: pool(["Broken transmission incoming.", "Shrine frequency locked on you."]),
    BOSS_PHASE: pool(["Listen. Rebuild kana. Choose meaning. Answer the phrase."]),
    FAILURE: pool(["Silence. Then static."]),
    PERFECT_CLEAR: pool(["Static clears into a single voice line."]),
    REMATCH: pool(["One replay max — do not lean on the echo."]),
  },
  bossPattern: "inherit-definition",
  visualProfile: {
    cssClass: "nozomi-master--broadcast-spirit",
    palette: ["black", "dim-red", "paper-white", "static-grey"],
    motionClass: "nozomi-master-motion--flicker",
    collapseId: "static-clear",
  },
}

const GATE_DEVOURER: DungeonMasterDefinition = {
  id: "gate-devourer",
  displayName: "The Gate Devourer",
  domainLabel: "Crimson Gate",
  crestGlyph: "瞳",
  personalityTags: ["violent", "primal", "minimal"],
  masteryFocus: ["fast recall", "pressure handling", "known vocabulary under stress"],
  uniqueRuleId: "hunger",
  uniqueRuleSummary: "Wrong answers feed the boss. Streaks starve it.",
  pressureStyle: "UI rupture and survival chains",
  perfectClearReward: {
    title: "Crimson Survivor",
    relicKey: "devoured-seal",
    techniqueLabel: "Last Focus",
  },
  dialoguePools: {
    ENTRY: pool(["WRONG feeds me.", "RUN or answer."]),
    FIRST_MISTAKE: pool(["WRONG.", "FEED."]),
    STREAK: pool(["Starving.", "Weakened."]),
    CORRUPTION: pool(["The gate breathes faster.", "Hunger rising."]),
    BOSS_AWARENESS: pool(["Eye opens.", "Survival chain begins."]),
    BOSS_PHASE: pool(["Five rapid answers. One counter seal. Extract or die."]),
    FAILURE: pool(["RUN AGAIN.", "Devoured."]),
    PERFECT_CLEAR: pool(["Gate implodes. You survived."]),
    REMATCH: pool(["Corruption starts at half. No mercy."]),
  },
  bossPattern: "inherit-definition",
  visualProfile: {
    cssClass: "nozomi-master--gate-devourer",
    palette: ["black", "blood-red", "hot-magenta", "burnt-orange"],
    motionClass: "nozomi-master-motion--pulse",
    collapseId: "gate-implode",
  },
}

const MIRROR_HUNTER: DungeonMasterDefinition = {
  id: "mirror-hunter",
  displayName: "The Mirror Hunter",
  domainLabel: "Reflection Sector",
  crestGlyph: "◇",
  personalityTags: ["eerily calm", "mocking", "reflective"],
  masteryFocus: ["personal weak words", "response speed", "anti-habit training"],
  uniqueRuleId: "reflection",
  uniqueRuleSummary: "Uses your failed words, abandoned quests, and slow answers.",
  pressureStyle: "Comparison and predicted wrong options",
  perfectClearReward: {
    title: "Self-Bound",
    relicKey: "cracked-hunter-crest",
    techniqueLabel: "Shadow Read",
  },
  dialoguePools: {
    ENTRY: pool(["I am what you avoid.", "Your codename echoes here."]),
    FIRST_MISTAKE: pool(["You hesitate here. Again.", "Let us carve that weakness out."]),
    STREAK: pool(["You broke your pattern — briefly."]),
    BOSS_AWARENESS: pool(["I already chose your wrong answer.", "Shadow option armed."]),
    BOSS_PHASE: pool(["Avoid your habit. I showed you the trap."]),
    FAILURE: pool(["Predictable.", "Mine."]),
    PERFECT_CLEAR: pool(["Shadow kneels. Crest syncs."]),
    REMATCH: pool(["Only your weak words. Nothing generic."]),
  },
  bossPattern: "inherit-definition",
  visualProfile: {
    cssClass: "nozomi-master--mirror-hunter",
    palette: ["black", "silver", "inverted-purple", "cold-blue"],
    motionClass: "nozomi-master-motion--mirror",
    collapseId: "shadow-sync",
  },
}

const COLLAPSE_ECHO: DungeonMasterDefinition = {
  ...GATE_DEVOURER,
  id: "collapse-echo",
  displayName: "Collapse Echo",
  domainLabel: "Corruption Run",
  crestGlyph: "◎",
  uniqueRuleId: "collapse-hunger",
  uniqueRuleSummary: "Corruption starts elevated. Every mistake feeds the collapse.",
  dialoguePools: {
    ...GATE_DEVOURER.dialoguePools,
    ENTRY: pool(["Loop opens at half corruption.", "The collapse already tastes you."]),
  },
  visualProfile: {
    cssClass: "nozomi-master--collapse-echo",
    palette: ["black", "blood-red", "neon-magenta"],
    motionClass: "nozomi-master-motion--pulse",
    collapseId: "collapse-implode",
  },
}

const VOID_STALKER: DungeonMasterDefinition = {
  ...MIRROR_HUNTER,
  id: "void-stalker",
  displayName: "Void Stalker",
  domainLabel: "Void Pursuit",
  crestGlyph: "∅",
  dialoguePools: {
    ...MIRROR_HUNTER.dialoguePools,
    ENTRY: pool(["Distance is survival.", "I hunt your slowest decode."]),
  },
  visualProfile: {
    cssClass: "nozomi-master--void-stalker",
    palette: ["black", "cold-blue", "silver"],
    motionClass: "nozomi-master-motion--mirror",
    collapseId: "void-fade",
  },
}

const SHRINE_WARDEN: DungeonMasterDefinition = {
  ...BROADCAST_SPIRIT,
  id: "shrine-warden",
  displayName: "Shrine Warden",
  domainLabel: "Roguelike Sector",
  crestGlyph: "⛩",
  dialoguePools: {
    ...BROADCAST_SPIRIT.dialoguePools,
    ENTRY: pool(["Modifiers mutate. My signal mutates with them.", "Instability is the ritual."]),
  },
  visualProfile: {
    cssClass: "nozomi-master--shrine-warden",
    palette: ["black", "dim-red", "shrine-white"],
    motionClass: "nozomi-master-motion--flicker",
    collapseId: "shrine-static",
  },
}

export const DUNGEON_MASTER_REGISTRY: Record<DungeonMasterId, DungeonMasterDefinition> = {
  "neon-warden": NEON_WARDEN,
  archivist: ARCHIVIST,
  "broadcast-spirit": BROADCAST_SPIRIT,
  "gate-devourer": GATE_DEVOURER,
  "mirror-hunter": MIRROR_HUNTER,
  "collapse-echo": COLLAPSE_ECHO,
  "void-stalker": VOID_STALKER,
  "shrine-warden": SHRINE_WARDEN,
}

/** Overlay: dungeon config key → master id */
export const DUNGEON_KEY_TO_MASTER: Record<string, DungeonMasterId> = {
  "dungeon:neon-corridor": "neon-warden",
  "dungeon:shadow-archive": "archivist",
  "dungeon:roguelike-sector": "broadcast-spirit",
  "dungeon:abyss-core": "gate-devourer",
  "dungeon:void-pursuit": "mirror-hunter",
  "dungeon:corruption-run": "collapse-echo",
}

export function getMasterDefinition(id: DungeonMasterId): DungeonMasterDefinition {
  return DUNGEON_MASTER_REGISTRY[id]
}

export function resolveMasterIdForDungeonKey(key: string): DungeonMasterId {
  const id = DUNGEON_KEY_TO_MASTER[key]
  if (!id) {
    return "neon-warden"
  }
  return id
}

export function pickDialogueLine(
  master: DungeonMasterDefinition,
  moment: MasterDialogueMoment,
  seed: string
): string | null {
  const poolLines = master.dialoguePools[moment]
  if (!poolLines?.length) return null
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  const idx = h % poolLines.length
  return poolLines[idx] ?? null
}
