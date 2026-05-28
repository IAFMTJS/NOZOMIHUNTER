# Dungeon Failure Flow

Run exhausts encounter strikes → `failDungeonRun` → `machineState: FAILURE`.

## UI

- `DungeonRunner` uses `shouldShowDungeonFailureCeremony(state, dismissed)`.
- `DungeonFailureCeremony` overlay — E2E selector `dungeon-failure-ceremony` (`E2E_TEST_IDS.dungeonFailureCeremony`).
- Player taps **Accept consequence** → overlay dismisses; run remains FAILURE until redeploy/abandon path.

## QA

- Unit: `tests/dungeonFailureCeremonyFlow.test.ts`
- Audit: `scripts/authenticated-audit.mjs` screenshots overlay when an active run is already in FAILURE.
