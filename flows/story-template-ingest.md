# Flow — story template ingest

1. Author story rows in `content/seeds/content-contracts.json` (channel `story`) or extend `scripts/generate-content-seeds.mjs`.
2. Run `npm run generate:content-seeds`.
3. Run `npm run ingest:content` (requires `SUPABASE_SERVICE_ROLE_KEY`).
4. Run `npm run verify:deploy` — expects `content_contracts` ≥ 100.
5. In app, `/contracts` story channel uses `pickContentContractTemplate("story", …)` at 70% roll.
