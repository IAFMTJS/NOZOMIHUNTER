# Supabase Setup

NOZOMI uses **Supabase for auth and data only** — no OpenAI or other paid APIs.

## 1. Create project

Create a free project at [https://supabase.com](https://supabase.com).

## 2. Run migration

From the project root (after `npm install`), push migrations to your linked Supabase project:

```bash
npm run db:push
```

Equivalent: `npx supabase db push`. The global `supabase` command is **not** required — the CLI is installed as a dev dependency.

If you see `supabase is not recognized`, you ran the bare command outside npm; use `npm run db:push` instead.

First-time link (once per machine):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

Alternatively, apply SQL manually in the dashboard SQL Editor, in order:

1. [`supabase/migrations/001_foundation.sql`](../supabase/migrations/001_foundation.sql)
2. [`supabase/migrations/002_jmdict_vocabulary.sql`](../supabase/migrations/002_jmdict_vocabulary.sql)
3. [`supabase/migrations/003_progression_guards.sql`](../supabase/migrations/003_progression_guards.sql) — speech rate limits + legacy XP delta guard
4. [`supabase/migrations/004_quest_completion_and_analytics.sql`](../supabase/migrations/004_quest_completion_and_analytics.sql) — `complete_quest_guarded`, strict autosave XP, `gameplay_events`
5. [`supabase/migrations/005_hunter_identity_sync.sql`](../supabase/migrations/005_hunter_identity_sync.sql) — codename, registry ID, discipline sync chain on `profiles`
6. [`supabase/migrations/006_economy_inventory.sql`](../supabase/migrations/006_economy_inventory.sql) — credits/stamina/brew, `item_catalog`, `player_inventory`, `tracked_quest_id`, guarded `spend_stamina_guarded`, `brew_word_guarded`, `clear_pending_rewards_guarded`, inventory grants on completion
7. [`supabase/migrations/007_economy_fixes.sql`](../supabase/migrations/007_economy_fixes.sql) — stamina unlock JSONB fix, refund RPC, hidden-objective completion
8. [`supabase/migrations/008_shop_and_guards.sql`](../supabase/migrations/008_shop_and_guards.sql) — shop (`credit_price`, `purchase_item_guarded`), server daily stamina, starter blade equipped
9. [`supabase/migrations/009_unlock_home_key.sql`](../supabase/migrations/009_unlock_home_key.sql) — rename legacy `dashboard` unlock key to `home`
10. [`supabase/migrations/010_rpg_stats.sql`](../supabase/migrations/010_rpg_stats.sql) — RPG stat columns on progression
11. [`supabase/migrations/011_shop_economy.sql`](../supabase/migrations/011_shop_economy.sql) — black market rotation, shop item catalog expansion, `active_boosts`, XP conversion, `use_consumable_guarded`
12. [`supabase/migrations/012_shop_effect_hooks.sql`](../supabase/migrations/012_shop_effect_hooks.sql) — `consume_active_boost_guarded`, `reactivate_failed_quest_guarded`
13. [`supabase/migrations/013_completion_boosts.sql`](../supabase/migrations/013_completion_boosts.sql) — server-side completion boost math, catalog effect columns, title unlock in `use_consumable_guarded`

### Manual verification (boosted completion)

After activating XP Booster + Reward Amplifier, complete a quest and confirm RPC `xp_gained` / `credits_gained` reflect boosts and `active_boosts` drops consumed entries in the same transaction.

## 3. Auth providers

All login flows go through **Supabase Auth** (no custom OAuth outside Supabase):

- **Email:** Authentication → Providers → Email → enable (sign-in + sign-up; optional email confirmation).
- **Magic link:** same Email provider; uses `signInWithOtp` from the app.
- **Google:** Authentication → Providers → Google → enable, add OAuth client credentials.
- **Anonymous (guest):** Authentication → Providers → Anonymous → enable.

## 4. Redirect URLs

Site URL: `http://localhost:3000`

Redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://<production-domain>/auth/callback`

## 5. Environment

Copy `.env.example` to `.env.local` in the project root (same folder as `package.json`), then set **only**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You do not need any AI API keys.

**Important:** Restart `npm run dev` after creating or editing `.env.local` — Next.js only loads env files on startup.

## 6. Verify auth

1. `npm run dev`
2. Open `/login`
3. Sign in with **email/password**, **magic link**, **Google** (OAuth via Supabase), or **guest** (anonymous)
4. You should land on `/home` with a session cookie

If guest login fails, confirm Anonymous sign-in is enabled in the Supabase dashboard.

## 7. JMDict vocabulary

### Curated catalog (shipped in repo)

The app ships **215** JMdict-backed entries in `src/data/jmdictCurated.generated.ts`. To regenerate from the manifest (`content/jmdict-curated-manifest.json`):

```powershell
npm run build:curated -- --download
# or, if you already have the XML:
npm run build:curated -- data/JMdict_e.xml
```

`data/JMdict_e.xml` is gitignored; `--download` fetches `JMdict_e.gz` into `data/` and decompresses.

### Full dictionary ingest (optional)

1. Download **JMdict_e** XML from [EDRDG — JMdict_e](https://www.edrdg.org/wiki/index.php/JMdict_e) (pick the English XML archive; extract `JMdict_e.xml`), or use `data/JMdict_e.xml` from `build:curated --download`.
2. Run ingest with the **actual file path** (not the doc placeholder `path/to/...`):

```powershell
npm run ingest:jmdict -- "$env:USERPROFILE\Downloads\JMdict_e.xml"
```

Adjust the path if you saved the file elsewhere.

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see `.env.example`). The script loads `.env.local` automatically. **Curated vocabulary works without ingest** — you only need this for the full dictionary in Supabase.

The browser client may **read** `vocabulary_entries` (authenticated) but must not upsert — RLS allows only `SELECT`. Bulk writes use the ingest script with the service role key.
