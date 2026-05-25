# Presentation flow

Penalty, ceremony, and encounter feedback layers map player state and game mode emotions to CSS, audio, and fullscreen interrupts.

Ceremony map: [gamefeel-ceremonies.md](gamefeel-ceremonies.md).

## Encounter feedback (v1.3.0+)

1. `EncounterRouter` wraps encounters in `EncounterFeedbackProvider`
2. Answer events → `encounterFeedbackOrchestrator` → channel profile from `presentation-contract.ts`
3. `EncounterImpactLayer` applies CSS bursts / glitch / dungeon-unstable classes
4. `registerAudioHandlers` plays confirm / error / combo / corruption cues (no duplicate audio from impact layer)

Channels: `DAILY`, `MAIN`, `SIDE`, `TRAINING`, `DUNGEON`.

## Ceremonies

| Moment | Component |
|--------|-----------|
| Level up | `LevelUpCeremony` + `momentFreezeSystem` |
| Dungeon extract | `DungeonClearCeremonyFlow` |
| Pending rewards | `RewardClaimOverlay` + `GateClearedScreen` |
| Achievement | `AchievementUnlockCeremony` |

## Corruption tiers

| Threshold | Class | Effect |
|-----------|-------|--------|
| 25 | `nozomi-corruption-low` | Scanlines |
| 50 | `nozomi-corruption-high` | Strong scanlines |
| 75 | `nozomi-corruption-extreme` | Fake UI overlay (survival modes) |

## Audio

- `playAmbience` / `stopAmbience` on encounter and dungeon enter
- Event bus hooks in `registerAudioHandlers` (incl. `achievement`, `rewardCascade`, `MASTERY_TIER_UP`)
- Procedural fallback when theme MP3s missing — see `public/audio/README.md`

## Haptics

- `hapticsSystem`: level-up, dungeon clear, combo milestones (where supported)

## Learner assists

- `assistLevel` on `PlayerProgressionContract`: FULL | REDUCED | BLACKOUT
- `LearnerAssistProvider` + `useLearnerAssist` gate romaji in `LearnerWordLine`
- Mode `pressure.hideAssists` forces blackout during encounter

## Reactive feedback

`reactiveFeedbackSystem` uses `GameModeEmotion` for toast variant selection.
