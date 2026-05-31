import fs from "node:fs"
import path from "node:path"

const missions = [
  ["m01", "beat-s01-001", 1, "ch-01", "Registry Wake", "レジストリ覚醒", "VOCABULARY", "STANDARD", null, 3, null, null, "sector-01"],
  ["m02", "beat-s01-002", 2, "ch-01", "First Glyph", "第一の文字", "VOCABULARY", "TERMINAL_BREACH", "beat-s01-001", 3, "corridor-zero", null, "sector-01"],
  ["m03", "beat-s01-003", 3, "ch-01", "Silent Prayer", "静かな祈り", "LISTENING", "LOST_TRANSMISSION", "beat-s01-002", 3, null, null, "sector-01"],
  ["m04", "beat-s01-004", 4, "ch-01", "Iris Briefing", "アイリスブリーフィング", "CONVERSATION", "GHOST_INTERROGATION", "beat-s01-003", 0, "whisper-index", "iris-briefing", "sector-01"],
  ["m05", "beat-s01-005", 5, "ch-01", "Temple Signal", "寺院信号", "LISTENING", "ECHO_LISTENING", "beat-s01-004", 3, null, null, "sector-01"],
  ["m06", "beat-s01-006", 6, "ch-01", "Forgotten Names", "忘れられた名", "VOCABULARY", "MEMORY_CASCADE", "beat-s01-005", 4, null, null, "sector-01"],
  ["m07", "beat-s01-007", 7, "ch-01", "Archive Restoration", "記録復元", "VOCABULARY", "KANJI_SURGERY", "beat-s01-006", 4, null, null, "sector-01"],
  ["m08", "beat-s01-008", 8, "ch-01", "Hollow Gate", "虚ろの門", "VOCABULARY", "STANDARD", "beat-s01-007", 5, null, null, "sector-01"],
  ["m09", "beat-s01-009", 9, "ch-02", "Distorted Broadcast", "歪んだ放送", "LISTENING", "LOST_TRANSMISSION", "beat-s01-008", 3, null, null, "sector-02"],
  ["m10", "beat-s01-010", 10, "ch-02", "Neon Infiltration", "ネオン潜入", "VOCABULARY", "TERMINAL_BREACH", "beat-s01-009", 4, null, null, "sector-02"],
  ["m11", "beat-s01-011", 11, "ch-02", "Operator Seven", "オペレーター七", "CONVERSATION", "DEEP_COVER", "beat-s01-010", 0, "neon-grid-failure", "operator-seven", "sector-02"],
  ["m12", "beat-s01-012", 12, "ch-02", "Emergency Transmission", "緊急送信", "SPEECH", "SHADOW_ECHO", "beat-s01-011", 0, null, "field-relay", "sector-02"],
  ["m13", "beat-s01-013", 13, "ch-02", "Corridor Breach", "回廊突破", "DUNGEON", "STANDARD", "beat-s01-012", 0, null, null, "sector-02"],
  ["m14", "beat-s01-014", 14, "ch-02", "Warden Rematch", "監視者再戦", "DUNGEON", "STANDARD", "beat-s01-013", 0, "warden-phase-two", null, "sector-02"],
  ["m15", "beat-s01-015", 15, "ch-02", "Static Confession", "静止告白", "CONVERSATION", "GHOST_INTERROGATION", "beat-s01-014", 0, "iris-routing-table", "static-confession", "sector-02"],
  ["m16", "beat-s01-016", 16, "ch-02", "Signal Crown", "信号の冠", "VOCABULARY", "SURVIVAL_VOCAB", "beat-s01-015", 5, null, null, "sector-02"],
  ["m17", "beat-s01-017", 17, "ch-03", "Lexicon Debt", "語彙の負債", "VOCABULARY", "MEMORY_CASCADE", "beat-s01-016", 5, null, null, "sector-03"],
  ["m18", "beat-s01-018", 18, "ch-03", "Archivist Contact", "記録官接触", "CONVERSATION", "GHOST_INTERROGATION", "beat-s01-017", 0, null, "shadow-briefing", "sector-03"],
  ["m19", "beat-s01-019", 19, "ch-03", "Memory Vault", "記憶保管庫", "LISTENING", "LOST_TRANSMISSION", "beat-s01-018", 4, null, null, "sector-03"],
  ["m20", "beat-s01-020", 20, "ch-03", "Shadow Breach", "影の突破", "DUNGEON", "ARCHIVIST_BOSS", "beat-s01-019", 0, "semantic-collapse", null, "sector-03"],
  ["m21", "beat-s01-021", 21, "ch-03", "Forbidden Index", "禁断索引", "VOCABULARY", "ENTITY_HUNT", "beat-s01-020", 5, null, null, "sector-03"],
  ["m22", "beat-s01-022", 22, "ch-03", "Iris Truth", "アイリスの真実", "CONVERSATION", "DEEP_COVER", "beat-s01-021", 0, null, "iris-truth", "sector-03"],
  ["m23", "beat-s01-023", 23, "ch-04", "Abyss Probe", "深淵探査", "DUNGEON", "STANDARD", "beat-s01-022", 0, "void-priest-fragment", null, "sector-04"],
  ["m24", "beat-s01-024", 24, "ch-04", "Broken Signal Finale", "壊れた信号", "CONVERSATION", "SEMANTIC_NETWORK", "beat-s01-023", 0, "extraction-oath", "broken-signal-finale", "sector-04"],
]

const out = {
  seasonId: "season-01-broken-signal",
  missions: missions.map(
    ([suffix, beat, idx, ch, title, titleJa, type, mode, pre, wc, archive, scenario, sector]) => ({
      id: `story-s01-${suffix}`,
      storyBeatId: beat,
      missionIndex: idx,
      chapterId: ch,
      title,
      titleJa,
      template: {
        type,
        gameMode: mode,
        prerequisiteBeatId: pre ?? undefined,
        wordCount: wc || undefined,
        narrativeTier: "MAIN",
        seasonId: "season-01-broken-signal",
        chapterId: ch,
        missionIndex: idx,
        storyBeatId: beat,
        archiveUnlockId: archive ?? undefined,
        scenarioId: scenario ?? undefined,
        linkedSectorId: sector,
        linkedDungeonKey:
          suffix === "m13" || suffix === "m14"
            ? "dungeon:neon-corridor"
            : suffix === "m20"
              ? "dungeon:shadow-archive"
              : suffix === "m23"
                ? "dungeon:abyss-core"
                : undefined,
        description: `${title} — Season 1 main operation.`,
        briefing: `Registry dispatch — ${title.toLowerCase()} protocol active.`,
        minimumLevel: Math.max(1, Math.floor((idx - 1) / 3)),
      },
    })
  ),
}

const dest = path.join(
  process.cwd(),
  "content/seasons/season-01-broken-signal/story-missions.json"
)
fs.writeFileSync(dest, JSON.stringify(out, null, 2))
console.log("[build-season1-story]", out.missions.length, "missions →", dest)
