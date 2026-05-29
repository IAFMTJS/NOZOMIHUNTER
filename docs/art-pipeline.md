# Art pipeline (GDD Vol 9)

## Flow

```text
Concept → Review → Approval → Production → Implementation → QA → Release
```

## Registry

- **Local fallback:** [`content/seeds/asset-manifest.json`](../content/seeds/asset-manifest.json)
- **Runtime:** [`assetManifestSystem`](../src/systems/content/assetManifestSystem.ts)
- **UI:** [`GameAssetImage`](../src/components/ui/GameAssetImage.tsx) — never hardcode `/game-assets/` in features
- **DB:** `public.asset_manifest` (migration `021_asset_manifest.sql`)
- **Storage:** Supabase bucket `game-assets`

## Commands

```bash
node scripts/generate-placeholder-assets.mjs   # dev placeholders
npm run ingest:assets                          # upload + DB (needs service role)
```

## QA gates

1. **Visual test** — matches [`visual-direction-v2.md`](visual-direction-v2.md)
2. **Theme test** — reinforces Archive / hunter terminal
3. **Quality test** — not mistaken for unfinished placeholder in production builds
4. **Recognition test** — identifiable at card size

Replace placeholder SVGs with final WebP/AVIF from production art before season launch.

See [`art-commission-brief.md`](art-commission-brief.md) for the deliverable list and board references.
