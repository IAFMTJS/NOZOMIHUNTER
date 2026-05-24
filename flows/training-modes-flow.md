# Training modes flow

1. Player opens `/training`
2. Selects one of four `GameModeId` drills (unlock by level)
3. `startTrainingMission` → hidden quest with `gameMode` set
4. `EncounterRouter` renders mode-specific UI
5. Mode actions via `submitGameModeActionForQuest` or standard submit handlers
6. Completion grants XP + stat growth (training excluded from contract catalog)

Modes: SIGNAL_CALIBRATION, KANJI_SURGERY, MEMORY_CASCADE, SHADOW_ECHO
