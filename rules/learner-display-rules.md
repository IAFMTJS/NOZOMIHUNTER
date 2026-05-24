# Learner display rules

Every learner-facing word surface must show:

1. **Japanese** (primary kanji or kana form)
2. **Reading** (kana) where applicable
3. **Romaji** (derived from reading if not on the entry)
4. **Meaning** (English gloss)

Use `LearnerWordLine` from `src/components/ui/LearnerWordLine.tsx` and `learnerPartsFromCurated` from `src/services/jmdict/learnerFormat.ts`.

Compact format: `水 • みず • Water`

Optional `audio` prop enables `WordAudioButton` (Web Speech API).
