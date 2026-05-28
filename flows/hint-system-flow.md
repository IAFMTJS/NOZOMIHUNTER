# Hint System Flow

Immersive learning support during active encounters — not static tooltips.

## Channels

1. **Hunter Vision** — hold to briefly reveal masked layers (reading, romaji, meaning per policy).
2. **Companion Whisper** — tactical nudge lines; manual request or auto after repeated wrong answers.

## Pipeline

Encounter active target
→ `buildHintWordContext` (word + mastery + wrong count + prompt direction)
→ `EncounterHintProvider` (session charges, vision hold, whispers)
→ `LearnerWordLine` merges vision layers when hold is active
→ `EncounterHintControls` (UI)

## Policy

- Charges per encounter: `HINT_CONFIG` (`MAX_WHISPERS_PER_ENCOUNTER`, `MAX_VISION_CHARGES_PER_ENCOUNTER`).
- `AssistLevel` BLACKOUT disables both channels; REDUCED limits vision meaning.
- Staged mastery (`EXPOSURE` → `PRESSURE`) controls how much vision reveals.
- Auto whisper after `AUTO_WHISPER_AFTER_WRONG` failures on the current target.

## Events

- `HINT_WHISPER_SHOWN`
- `HINT_VISION_ACTIVATED`

## Surfaces

- Vocabulary encounters
- Listening encounters (after first signal heard)
- Speech encounters
- Training / game-mode encounters via `EncounterRouterDisplayShell` (`isRecallChallengeQuest`)

## Learner-display compliance checklist

| Surface | Provider | challengeMode | Notes |
|---------|----------|---------------|-------|
| `EncounterRouter` | `EncounterRouterDisplayShell` | per `encounterDisplayPolicy` | Replaces bare `LearnerAssistProvider` |
| Vocab / listen / speech | `EncounterDisplayProvider` | `promptDirection != null` | Inner provider overrides router defaults |
| Memory cascade | Router shell + `forceReveal` on flash | Brief reveal window only |
| Threat index browse | Default (full gloss) | `false` | Reference catalog, not active challenge |
| Word detail `/vocabulary/[id]` | Default | `false` | Study reference |
| Brew / prep panels | `forceReveal` or briefing context | N/A | Preparation is allowed to show more |

Run `tests/learnerDisplayCompliance.test.ts` and `tests/encounterDisplayPolicy.test.ts` after policy changes.
