# Presentation flow

Penalty and reactive feedback layers map player state and game mode emotions to CSS and toasts.

## Corruption tiers

| Threshold | Class | Effect |
|-----------|-------|--------|
| 25 | `nozomi-corruption-low` | Scanlines |
| 50 | `nozomi-corruption-high` | Strong scanlines |
| 75 | `nozomi-corruption-extreme` | Fake UI overlay (survival modes) |

## Audio

- `playAmbience` / `stopAmbience` on encounter and dungeon enter
- Event bus hooks in `registerAudioHandlers`

## Learner assists

- `assistLevel` on `PlayerProgressionContract`: FULL | REDUCED | BLACKOUT
- `LearnerAssistProvider` + `useLearnerAssist` gate romaji in `LearnerWordLine`
- Mode `pressure.hideAssists` forces blackout during encounter

## Reactive feedback

`reactiveFeedbackSystem` uses `GameModeEmotion` for toast variant selection.
