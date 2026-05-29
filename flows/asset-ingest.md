# Flow: Asset ingest

1. Artist delivers files to `public/game-assets/` (or run `npm run generate:assets` for placeholders).
2. Register keys in `content/seeds/asset-manifest.json`.
3. `npm run ingest:assets` uploads to Supabase `game-assets` bucket and upserts `asset_manifest`.
4. Client calls `hydrateContentCatalog()` on session start.
5. UI uses `GameAssetImage` with `assetKey` only.
