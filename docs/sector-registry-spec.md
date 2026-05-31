# Sector Registry Specification

Maps GDD Volume 6 sectors to runtime content. See [`season-01-broken-signal-bible.md`](season-01-broken-signal-bible.md) for Season 1 mission graph.

| Sector ID | Name | JLPT focus | Canon boss | Primary dungeon(s) | Word pool |
|-----------|------|------------|------------|-------------------|-----------|
| `sector-01` | Lost Alphabet | N5 kana + core | The Hollow Monk | Tutorial + prep routes | `sector-01-n5-core` |
| `sector-02` | Silent Signals | Listening N5–N4 | Signal Warden (Neon Warden) | `dungeon:neon-corridor` | `sector-02-listening` |
| `sector-03` | Broken Records | Vocabulary N4 | Memory Eater (Archivist) | `dungeon:shadow-archive` | `sector-03-n4-vocab` |
| `sector-04` | Ancient Archives | Kanji N3 | Archive Keeper | `dungeon:abyss-core` | `sector-04-n3-kanji` |
| `sector-05` | Void Library | Mixed N3–N2 | Void Priest | `dungeon:corruption-run` | `sector-05-mixed` |
| `sector-06` | Echo Nexus | Reading N2 | The Mirror Hunter | `dungeon:void-pursuit` | `sector-06-reading` |
| `sector-07` | Forgotten Horizon | Endgame N1 | The Broadcast Spirit | `dungeon:roguelike-sector` | `sector-07-endgame` |

## Sector States

`LOCKED` → `UNLOCKED` → `ACTIVE` → `CLEARED` | `CORRUPTED` | `CRITICAL`

Completion metrics per sector: story beats cleared, archive recovery %, boss clears, contract completion %.

## Implementation

- Registry: [`src/config/sectorRegistry.ts`](../src/config/sectorRegistry.ts)
- System: [`src/systems/world/sectorSystem.ts`](../src/systems/world/sectorSystem.ts)
- Word pools: `content/sectors/*/vocabulary-pools/`
