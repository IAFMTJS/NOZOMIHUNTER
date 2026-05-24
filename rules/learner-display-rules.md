# Learner display rules

Every learner-facing word surface must show:

1. **Japanese** (primary kanji or kana form)
2. **Reading** (kana) where applicable
3. **Romaji** (derived from reading if not on the entry)
4. **Meaning** (English gloss)

Use `LearnerWordLine` from `src/components/ui/LearnerWordLine.tsx`.

Map word data via `src/services/jmdict/learnerFormat.ts`:

- `learnerPartsFromCurated` — curated JMDict entries
- `learnerPartsFromEncounterWord` — encounter words, extraction rows
- `learnerPartsFromExtractionRow` — `WordExtractionPanel` rows

Encounter target rails: `EncounterRailWord` (compact triple, no audio).

Active drill targets: `LearnerWordLine` with `layout="stacked"` and optional `audio`.

Listening encounters: no visible gloss on the station (listen-first); meaning appears after validation.

Compact format: `水 • みず • Water`

Optional `audio` prop enables `WordAudioButton` (Web Speech API).
