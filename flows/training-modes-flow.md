# Training modes flow

1. Player opens `/training` (arcade channel — `ArcadeCard` tiles, not contract rows)
2. Selects one of nine `GameModeId` drills (unlock by `gameModeRegistry.minLevel`)
3. `startTrainingMission` → hidden quest (`training-*` id, `hidden: true`, `narrativeTier: "DAILY"` for light completion tier)
4. `EncounterRouter` renders mode-specific UI shell
5. Mode actions via `submitGameModeActionForQuest` or standard submit handlers
6. Completion grants XP + stat growth (training excluded from contract catalog)

## Modes

| GameModeId | Type | Shell |
|------------|------|-------|
| SIGNAL_CALIBRATION | listening | `SignalCalibrationEncounter` |
| KANA_DASH | vocabulary | `KanaDashEncounter` |
| KANJI_SURGERY | vocabulary | `KanjiSurgeryEncounter` |
| MEMORY_CASCADE | vocabulary | `MemoryCascadeEncounter` |
| SHADOW_ECHO | speech | `ShadowEchoEncounter` |
| ECHO_LISTENING | phrase reconstruction tiles | `EchoListeningEncounter` + `echoListeningSystem` |
| SHADOW_TYPING | decay TTL on prompt | `ShadowTypingEncounter` + `shadowTypingSystem` |
| MEMORY_GRID | pair-match grid + timer | `MemoryGridEncounter` + `memoryGridSystem` |
| SURVIVAL_VOCAB | waves, fail on 1 wrong | `SurvivalVocabEncounter` + `survivalVocabSystem` |

Feedback channel: `TRAINING` (high impact per `presentation-contract.ts`).
