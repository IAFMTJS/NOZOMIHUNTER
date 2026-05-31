# Flow — story template ingest

1. Author Season 1 missions in `content/seasons/season-01-broken-signal/story-missions.json` and side rows in `side-missions.json`.
2. Run `npm run build:content-seeds` — generates `content-story-beats.json`, `content-encounter-scripts.json`, and expands `content-archive.json`.
3. Run `npm run sync:content-contracts` — merges authored story/side contracts into `content/seeds/content-contracts.json` (replaces procedural "Main arc N" rows).
4. Run `npm run validate:content` — schema + prerequisite checks.
5. Run `npm run ingest:content` (requires `SUPABASE_SERVICE_ROLE_KEY`) — upserts contracts, beats, scripts, archive, boss phases, achievements.
6. Run `npm run verify:deploy` — expects `content_contracts` ≥ 100.
7. In app, `/contracts` story channel uses Season 1 missions via `seasonContentLoader` + `missionCatalogMetadata` overlays.

**Deprecated:** procedural story generation in `scripts/generate-content-seeds.mjs` for channel `story` — use authored Season pack instead.
