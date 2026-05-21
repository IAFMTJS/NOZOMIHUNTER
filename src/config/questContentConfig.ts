export const VOCABULARY_QUEST_VARIANTS = [
  {
    title: "Word Hunt",
    description: "Hunter contract: identify field targets by romaji or English.",
    briefing:
      "The system has flagged several vocabulary signatures. Read each kanji and report the reading or meaning.",
  },
  {
    title: "Glyph Sweep",
    description: "Clear corrupted glyph markers before they spread.",
    briefing:
      "Each marker corresponds to a real word. Match the symbol to its reading or gloss.",
  },
  {
    title: "Archive Recovery",
    description: "Recover lost terms from a damaged lexicon shard.",
    briefing:
      "Fragments surfaced in the archive. Verify each term to stabilize the record.",
  },
] as const
