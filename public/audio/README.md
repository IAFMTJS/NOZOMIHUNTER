# Dungeon audio assets (optional)

Place royalty-free MP3 files here to override procedural Web Audio cues. If a file is missing, `playThemedCue` falls back to synthesized tones.

| Path | Theme | Cue |
|------|-------|-----|
| `cyber-sector.mp3` | CYBER_TOKYO | sector |
| `cyber-extract.mp3` | CYBER_TOKYO | extract |
| `archive-sector.mp3` | SHADOW_ARCHIVE | sector |
| `archive-extract.mp3` | SHADOW_ARCHIVE | extract |

Configured in [`src/systems/audio/themedAudioSystem.ts`](../../src/systems/audio/themedAudioSystem.ts).

## Ceremony & feedback cues (procedural)

These play via [`src/systems/audio/audioSystem.ts`](../../src/systems/audio/audioSystem.ts) without MP3 files:

| Cue ID | When |
|--------|------|
| `levelUp` | Level-up ceremony (also haptic on supported devices) |
| `combo2` / `combo5` | Encounter streak milestones at 3 and 5+ |
| `comboBreak` | Streak broken after 3+ correct |
| `rewardTick` | Each line in sequential reward reveal |
| `sectorClear` / `questComplete` | Dungeon clear and gate overlays |

Optional MP3 overrides (add when available):

| Path | Cue |
|------|-----|
| `level-up-sting.mp3` | levelUp (future themedAudio hook) |
| `reward-tick.mp3` | rewardTick |
