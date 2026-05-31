# Art commission brief (Vol 9 — production replacement)

Use this when replacing MVP placeholder SVGs in [`public/game-assets/`](../public/game-assets/) with final art.

## Visual north star

Reference boards (layout + mood, not pixel copy):

| Board | File | Route | Must read as |
|-------|------|-------|--------------|
| 1 Command node | [`board-1-command-node.png`](assets/reference/board-1-command-node.png) | `/home` | Vertical ops stack, objective hero, corruption weight |
| 2 Mode identity | [`board-2-mode-identity.png`](assets/reference/board-2-mode-identity.png) | `/training`, contracts | Discipline lanes, priority hero, arcade HUD density |
| 3 Dungeon flow | [`board-3-dungeon-flow.png`](assets/reference/board-3-dungeon-flow.png) | `/dungeons/*` | Entry tension, boss frame, extraction ceremony |

Palette: dark archive terminal — `#030508` base, accent violet `#7a5cff`, success `#5cff9b`, danger `#ff5c7a`. See [`visual-direction-v2.md`](visual-direction-v2.md).

## Deliverable list (MVP production set)

| asset_key | Size | Notes |
|-----------|------|-------|
| `hero.home.command` | 1280×720 WebP + PNG | Fog/rain optional layer; objective card safe zone left third |
| `hero.training.priority` | 1280×720 | Four discipline lane color hints (listening/reading/writing/speaking) |
| `hero.dungeon.entry` | 1280×720 | Boss silhouette center-right; corruption meter safe zone bottom |
| `hero.contract.file` | 1280×400 | Wide banner; risk gauge + CTA bottom-right |
| `hero.world.map` | 1280×720 | Illustrated hex nodes; selection glow on active sector |
| `boss.neon-warden` | 800×800 | Frame + glyph; readable at 120px in HUD |
| `boss.shadow-archivist` | 800×800 | Archive motif; purple-black |
| `boss.void-priest` | 800×800 | Void purple; phase integrity overlay friendly |
| `season.fracture-week.banner` | 1280×320 | Season chip + profile prestige frame |
| `npc.iris.portrait` | 512×512 | Circle crop safe; spectral routing aesthetic |
| `loading.panel.1`–`5` | 1280×720 | Lore tip + sector art; rotate set |
| `corruption.stage.1`–`4` | 640×360 | Overlay-friendly; increasing glitch/fracture |
| `relic.*` (5 icons) | 256×256 | Match shop catalog keys in manifest |

## Technical requirements

- **Format:** WebP primary, PNG fallback; SVG only for UI crest if needed
- **Naming:** Match `asset_key` in [`content/seeds/asset-manifest.json`](../content/seeds/asset-manifest.json) — dark files use dot notation (`hero.home.command.webp`); light companions use `.light.webp` (`hero.home.command.light.webp`). Drop commission PNGs as `*-light.png` and run `npm run normalize:light`.
- **Ingest:** `npm run ingest:assets` (updates Supabase `game-assets` bucket + `asset_manifest`)
- **UI rule:** Features use `<GameAssetImage assetKey="…" />` — never hardcode paths

## QA before merge

1. Card-size recognition test (boss/relic at 64–128px)
2. Theme test — reads as hunter terminal, not generic SaaS
3. `npm run check:theme` green
4. `npm run check:visual` with dev server — screen markers present

## Placeholder → production workflow

```bash
# Drop files into public/game-assets/… matching manifest paths
npm run ingest:assets
node scripts/verify-deploy.mjs
```

Replace `SECTOR ART — PLACEHOLDER` watermark in any interim builds before public season launch.
