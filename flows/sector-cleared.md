# Flow: Sector cleared

1. Dungeon encounter completes → `onSectorCleared` in persistence.
2. `SECTOR_CLEARED` event emitted.
3. `DungeonRunner` shows `SectorClearedBeat` (~800ms).
4. Route advances to REWARD or next sector.
5. Optional `sectorClear` audio cue on event bus (audio handlers).
