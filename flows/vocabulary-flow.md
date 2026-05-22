# Vocabulary Flow (Phase 3)

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

Events:

- `VOCABULARY_MASTERED`
