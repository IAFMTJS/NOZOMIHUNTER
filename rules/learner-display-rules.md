# Learner display rules

## Browse / catalog (Threat Index, dossiers)

Every learner-facing word surface must show:

1. **Japanese** (primary kanji or kana form)
2. **Reading** (kana) where applicable
3. **Romaji** (derived from reading if not on the entry)
4. **Meaning** (English gloss)

Use `LearnerWordLine` from `src/components/ui/LearnerWordLine.tsx` with `forceReveal` or non-challenge context.

## Active challenge state (encounters)

During **ACTIVE** challenge prompts, never show kanji + romaji + English together.

Use `ChallengeDisplayProvider` + `challengeDisplaySystem.resolveVisibleLayers`:

- **RETRIEVE_ENGLISH** → show Japanese + romaji; hide meaning
- **RETRIEVE_JAPANESE / RETRIEVE_READING** → show meaning only; hide Japanese stack
- **LISTEN_DECODE** → show no glyphs until after successful decode
- **SPEAK_JAPANESE** → show meaning prompt only; expect spoken/typed Japanese

Lock answer input to a single mode (`english`, `romaji`, `kana`, `japanese`) per prompt.

## Post-success reveal

After a correct answer, briefly set phase to **REVEALED** and show the full triple with `nozomi-mask-reveal` animation.

## Components

Map word data via `src/services/jmdict/learnerFormat.ts`:

- `learnerPartsFromCurated` — curated JMDict entries
- `learnerPartsFromEncounterWord` — encounter words, extraction rows
- `learnerPartsFromExtractionRow` — `WordExtractionPanel` rows

Encounter target rails: `EncounterRailWord` with `slotState` (`done` | `current` | `pending`).

Listening encounters: no visible gloss on the station until validation (`ListeningStationDisplay masked`).

Compact format (browse only): `水 • みず • Water`

Optional `audio` on reveal only during challenges (avoid leaking answers via TTS).
