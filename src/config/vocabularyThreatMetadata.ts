/** Curated word ids (entSeq strings) with elevated threat for encounters. */

/** Boss-phase and warden terminology — always SECTOR_CRITICAL in context. */
export const BOSS_CRITICAL_WORD_IDS = new Set([
  "100005", // 門 gate
  "100012", // 封印 seal
  "100020", // 結界 barrier
  "100007", // 魂 soul
  "100018", // 魔 demon
  "100014", // 闇 darkness
  "100013", // 覚醒 awakening
])

/** Per-dungeon sector-critical vocabulary (dungeon key → word ids). */
export const DUNGEON_SECTOR_CRITICAL: Record<string, readonly string[]> = {
  "dungeon:neon-corridor": ["100004", "100021", "100024"], // shadow, pursuit, danger
  "dungeon:shadow-archive": ["100022", "100019", "100011"], // infiltration, spirit, trap
}

export function isBossCriticalWord(wordId: string): boolean {
  return BOSS_CRITICAL_WORD_IDS.has(wordId)
}

export function isDungeonSectorCriticalWord(
  wordId: string,
  dungeonKey?: string
): boolean {
  if (!dungeonKey) return false
  const ids = DUNGEON_SECTOR_CRITICAL[dungeonKey]
  return ids?.includes(wordId) ?? false
}
