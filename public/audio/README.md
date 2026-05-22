# Dungeon audio assets (optional)

Place royalty-free MP3 files here to override procedural Web Audio cues. If a file is missing, `playThemedCue` falls back to synthesized tones.

| Path | Theme | Cue |
|------|-------|-----|
| `cyber-sector.mp3` | CYBER_TOKYO | sector |
| `cyber-extract.mp3` | CYBER_TOKYO | extract |
| `archive-sector.mp3` | SHADOW_ARCHIVE | sector |
| `archive-extract.mp3` | SHADOW_ARCHIVE | extract |

Configured in [`src/systems/audio/themedAudioSystem.ts`](../../src/systems/audio/themedAudioSystem.ts).
