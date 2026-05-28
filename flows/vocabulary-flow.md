# Vocabulary Flow (Phase 3)

Threat index UI: **Threats** (default) | **Conquered** | **All** — `vocabularyCatalogSystem`
Display: Japanese + reading + romaji + meaning via `LearnerWordLine` — see `rules/learner-display-rules.md`
Instability: `memoryDecaySystem` from `last_seen_at` + mastery (surfaces on Threats tab)
Threat display: `resolveVocabularyThreat(wordId, context, instability)` — instability ≥ 70 bumps ROUTINE → ELEVATED and ELEVATED → CRITICAL (presentation only)
Encounter rails: full compact triple via `EncounterRailWord`; listening station stays listen-first (no gloss until feedback)

Catalog init (`initVocabularyCatalog` — **215** JMdict curated entries; optional DB read-only extend up to `JMDICT_DB_LOAD_LIMIT`)
↓
Player hydrate → load mastery from `word_mastery`
↓
Quest generation → `pickWordsByFrequency` (low mastery, high frequency)
↓
**Preparation** (`vocabulary-preparation-flow.md`): detect unknown → prioritize critical → mission briefing
↓
Encounter answer → `matchesChallengeAnswer` (locked input mode from `promptDirection`)
↓
Challenge UI: ACTIVE masks glosses per direction; brief REVEALED phase after correct (`VocabularyEncounter` local reveal)
↓
Wrong answers → +1 corruption (`corruptionDeltaForWrongAnswer`); pressure copy from `encounterPressureSystem`
↓
Mastery delta (+12 correct / -4 wrong)
↓
Canonical UI tiers via `masteryPresentationSystem` (UNKNOWN → SEEN → FAMILIAR → STABLE → MASTERED)
↓
`MASTERY_TIER_UP` when tier boundary crossed
↓
Persist mastery row (Supabase)
↓
`VOCABULARY_MASTERED` when mastery ≥ 80

Preparation systems: `/src/systems/vocabulary/*` — see `flows/vocabulary-preparation-flow.md`

Curated rebuild (authoring):

`content/jmdict-curated-manifest.json` → `npm run build:curated -- --download` (or pass path to `JMdict_e.xml`) → `src/data/jmdictCurated.generated.ts`

Bulk ingest (optional, extends runtime catalog):

JMDict XML → `parseJmdictXml` → `npm run ingest:jmdict -- <file.xml>`

TTS: `WordAudioButton` / `useJapaneseTts` (Web Speech API — device-dependent quality)

Events:

- `VOCABULARY_MASTERED`
- `MASTERY_TIER_UP`
- `WORD_BREWED`
