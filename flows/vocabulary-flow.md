# Vocabulary Flow (Phase 3)

Threat index UI: **Threats** (default) | **Conquered** | **All** — `vocabularyCatalogSystem`
Display: Japanese + reading + romaji + meaning via `LearnerWordLine` — see `rules/learner-display-rules.md`
Instability: `memoryDecaySystem` from `last_seen_at` + mastery (surfaces on Threats tab)
Threat display: `resolveVocabularyThreat(wordId, context, instability)` — instability ≥ 70 bumps ROUTINE → ELEVATED and ELEVATED → CRITICAL (presentation only)
Encounter rails: full compact triple via `EncounterRailWord`; listening station stays listen-first (no gloss until feedback)

Catalog init (curated in-memory; optional DB read-only extend)
↓
Player hydrate → load mastery from `word_mastery`
↓
Quest generation → `pickWordsByFrequency` (low mastery, high frequency)
↓
**Preparation** (`vocabulary-preparation-flow.md`): detect unknown → prioritize critical → mission briefing
↓
Encounter answer → normalize → validate
↓
Mastery delta (+12 correct / -4 wrong)
↓
Persist mastery row (Supabase)
↓
`VOCABULARY_MASTERED` when mastery ≥ 80

Preparation systems: `/src/systems/vocabulary/*` — see `flows/vocabulary-preparation-flow.md`

Bulk ingest (optional):

JMDict XML → `parseJmdictXml` → `npm run ingest:jmdict -- <file.xml>`

TTS: `WordAudioButton` / `useJapaneseTts` (Web Speech API — device-dependent quality)

Events:

- `VOCABULARY_MASTERED`
- `WORD_BREWED`
