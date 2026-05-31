# Season 01 — The Broken Signal

Season ID: `season-01-broken-signal`  
Calendar: see [`src/config/seasonConfig.ts`](../src/config/seasonConfig.ts)

## Premise

The Hunter Network detects a repeating anomaly — a signal that speaks in half-corrupted Japanese. Iris assigns breach protocols. The registry already knows the player's designation before first login. Nozomi is never named directly until Act IV tease.

## Acts and Chapters

| Act | Chapter ID | Sector | Missions | Boss gate |
|-----|------------|--------|----------|-----------|
| I — Awakening | `ch-01` | sector-01 | 1–8 | Hollow Monk preview |
| II — Static | `ch-02` | sector-02 | 9–16 | Signal Warden / Neon Corridor |
| III — Debt | `ch-03` | sector-03 | 17–22 | Memory Eater / Shadow Archive |
| IV — Horizon | `ch-04` | sector-04+ | 23–24 | Season finale tease |

## Main Mission Graph

| Mission ID | Beat ID | Index | Title | Type | Mode | Prerequisite |
|------------|---------|-------|-------|------|------|--------------|
| `story-s01-m01` | `beat-s01-001` | 1 | Registry Wake | VOCABULARY | STANDARD | tutorial |
| `story-s01-m02` | `beat-s01-002` | 2 | First Glyph | VOCABULARY | TERMINAL_BREACH | beat-s01-001 |
| `story-s01-m03` | `beat-s01-003` | 3 | Silent Prayer | LISTENING | LOST_TRANSMISSION | beat-s01-002 |
| `story-s01-m04` | `beat-s01-004` | 4 | Iris Briefing | CONVERSATION | GHOST_INTERROGATION | beat-s01-003 |
| `story-s01-m05` | `beat-s01-005` | 5 | Temple Signal | LISTENING | ECHO_LISTENING | beat-s01-004 |
| `story-s01-m06` | `beat-s01-006` | 6 | Forgotten Names | VOCABULARY | MEMORY_CASCADE | beat-s01-005 |
| `story-s01-m07` | `beat-s01-007` | 7 | Archive Restoration | VOCABULARY | KANJI_SURGERY | beat-s01-006 |
| `story-s01-m08` | `beat-s01-008` | 8 | Hollow Gate | DUNGEON | STANDARD | beat-s01-007 |
| `story-s01-m09` | `beat-s01-009` | 9 | Distorted Broadcast | LISTENING | LOST_TRANSMISSION | beat-s01-008 |
| `story-s01-m10` | `beat-s01-010` | 10 | Neon Infiltration | VOCABULARY | TERMINAL_BREACH | beat-s01-009 |
| `story-s01-m11` | `beat-s01-011` | 11 | Operator Seven | CONVERSATION | DEEP_COVER | beat-s01-010 |
| `story-s01-m12` | `beat-s01-012` | 12 | Emergency Transmission | SPEECH | SHADOW_ECHO | beat-s01-011 |
| `story-s01-m13` | `beat-s01-013` | 13 | Corridor Breach | DUNGEON | STANDARD | beat-s01-012 |
| `story-s01-m14` | `beat-s01-014` | 14 | Warden Rematch | DUNGEON | STANDARD | beat-s01-013 |
| `story-s01-m15` | `beat-s01-015` | 15 | Static Confession | CONVERSATION | GHOST_INTERROGATION | beat-s01-014 |
| `story-s01-m16` | `beat-s01-016` | 16 | Signal Crown | VOCABULARY | SURVIVAL_VOCAB | beat-s01-015 |
| `story-s01-m17` | `beat-s01-017` | 17 | Lexicon Debt | VOCABULARY | MEMORY_CASCADE | beat-s01-016 |
| `story-s01-m18` | `beat-s01-018` | 18 | Archivist Contact | CONVERSATION | GHOST_INTERROGATION | beat-s01-017 |
| `story-s01-m19` | `beat-s01-019` | 19 | Memory Vault | LISTENING | LOST_TRANSMISSION | beat-s01-018 |
| `story-s01-m20` | `beat-s01-020` | 20 | Shadow Breach | DUNGEON | ARCHIVIST_BOSS | beat-s01-019 |
| `story-s01-m21` | `beat-s01-021` | 21 | Forbidden Index | VOCABULARY | ENTITY_HUNT | beat-s01-020 |
| `story-s01-m22` | `beat-s01-022` | 22 | Iris Truth | CONVERSATION | DEEP_COVER | beat-s01-021 |
| `story-s01-m23` | `beat-s01-023` | 23 | Abyss Probe | DUNGEON | STANDARD | beat-s01-022 |
| `story-s01-m24` | `beat-s01-024` | 24 | Broken Signal Finale | CONVERSATION | SEMANTIC_NETWORK | beat-s01-023 |

## Iris Trust Gates

| Trust tier | Range | Behavior |
|------------|-------|----------|
| UNKNOWN | 0–19 | English-heavy briefings |
| OBSERVING | 20–39 | Bilingual mission copy |
| COOPERATIVE | 40–59 | Japanese whispers on home |
| TRUSTED | 60–79 | Iris omits English on optional lines |
| CONFIDANT | 80+ | Act IV branch unlocked |

Trust increases on MAIN mission complete (+5), Japanese NPC responses (+2), archive reads (+1).

## Archive Unlock Schedule (Season 1)

| Fragment ID | Unlocks after beat |
|-------------|-------------------|
| `corridor-zero` | beat-s01-002 |
| `whisper-index` | beat-s01-004 |
| `neon-grid-failure` | beat-s01-013 |
| `iris-routing-table` | beat-s01-015 |
| `warden-phase-two` | beat-s01-014 |
| `semantic-collapse` | beat-s01-020 |
| `void-priest-fragment` | beat-s01-023 |
| `extraction-oath` | beat-s01-024 |

## Faction Beats

- **Hunters**: default player affiliation
- **Keepers**: Neon Warden, Archivist — rematch dialogue reveals former Hunters
- **Corrupted**: corruption spikes reference Lost Ones
- **Nozomi**: never confirmed; Act IV line 「望みは記録ではない」

## Dungeon Unlock Graph

```
tutorial → story-s01-m01..m07 → dungeon:neon-corridor (m13)
  → dungeon:shadow-archive (m20) → dungeon:abyss-core (m23)
```

## Content files

- Campaign graph: [`content/seasons/season-01-broken-signal/arc.json`](../content/seasons/season-01-broken-signal/arc.json)
- Mission contracts: [`content/sectors/sector-01-lost-alphabet/contracts/`](../content/sectors/sector-01-lost-alphabet/contracts/)
- Iris trees: [`content/narrative/iris/dialogue-trees.json`](../content/narrative/iris/dialogue-trees.json)
