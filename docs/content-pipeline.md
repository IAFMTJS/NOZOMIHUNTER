# Content pipeline

Season 1 and future content ship as **JSON packs** under `/content`, validated in CI, and loaded by systems — never hardcoded in UI.

## Directory layout

```text
content/
  seasons/season-01-broken-signal/
    arc.json              # act/chapter graph
    story-missions.json   # 24-beat main graph
    side-missions.json    # authored side templates
  sectors/sector-01-lost-alphabet/
    sector.json
    campaign.json
  narrative/iris/
    dialogue-trees.json
  seeds/
    content-contracts.json
    content-boss-phases.json
```

## Authoring flow

1. Write or update JSON under `content/` (see [`season-01-broken-signal-bible.md`](season-01-broken-signal-bible.md)).
2. Run `npm run validate:content` — fails on missing beats, duplicate IDs, or procedural `"Main arc N"` story titles.
3. Run `npm run build:season1-story` when regenerating the Season 1 mission graph from the bible.
4. Systems load packs via `seasonContentLoader.ts` and `contentContractTemplateSystem.ts`.
5. Optional DB ingest: `npm run ingest:content` (service role).

## Governance

- Story titles must be authored — `"Main arc N"` is banned in seeds and checked by `check:gdd-governance`.
- Procedural story fallback in `questChannelSystem` prefers Season 1 JSON over seed templates.
- New sectors follow [`sector-registry-spec.md`](sector-registry-spec.md).

## Verification

```bash
npm run validate:content
npm run check:gdd-governance
npm test
```
