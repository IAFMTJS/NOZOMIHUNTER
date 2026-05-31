# Mobile PWA — Hunter Client

NOZOMI can be installed as a lightweight PWA. Offline support is **shell-only**; auth, quests, and saves require network (Supabase).

## Install

### iOS (Safari → Home Screen)

1. Open the site in Safari (HTTPS required).
2. Tap **Share** → **Add to Home Screen**.
3. Launch **from the home screen icon** — not from a Safari tab.
4. On first open, tap **Allow invasion alerts** when prompted (iOS requires a tap each new install).
5. If you skipped it: **Profile → Settings → Invasion alerts**.

Push **does not work** in Safari tabs on iOS — only in the installed PWA (iOS 16.4+).

### Android / Chrome / Edge

1. Open the app over HTTPS (production or `npm run dev:mobile` on LAN).
2. Use **Install hunter client** when the field-deployment banner appears, or the browser’s “Install app” menu.

### iOS Safari

1. Open the site in Safari (HTTPS required for mic; TTS works after a tap).
2. Tap **Share** → **Add to Home Screen**.
3. Launch from the home screen for standalone display and safe-area insets.

Dismiss the install banner with **Dismiss**; it stays hidden until local storage is cleared.

## Service worker

- Registered in production only (`ServiceWorkerRegister` in root layout).
- Caches: `/`, `/home`, `/login`, and `/_next/static/*` on fetch.
- Does **not** cache Supabase or `/auth/` routes.
- Handles `push` + `notificationclick` for invasion deep links (`/home?anomaly=`).

Test locally:

```bash
npm run build
npm run start
```

## Push notifications (GitHub Actions)

Delivery is **not** via Supabase Edge Functions — scheduled sends run in GitHub Actions:

| Piece | Location |
|-------|----------|
| Opt-in UI | Settings → **Invasion alerts** |
| Subscription storage | `push_subscriptions` table (migration `027`) |
| Client subscribe | `pushNotificationSystem` + VAPID public key |
| Send worker | [`scripts/send-push-notifications.mjs`](../scripts/send-push-notifications.mjs) |
| Scheduler | [`.github/workflows/push-notifications.yml`](../.github/workflows/push-notifications.yml) |

### Setup

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. App env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public key only).
3. GitHub repo **Secrets** (Settings → Secrets and variables → Actions):
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` — e.g. `mailto:ops@yourdomain.com`
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (same as deploy)
4. Apply migration: `npm run db:push`
5. Manual test: Actions → **Push notifications** → **Run workflow** (enable **dry_run** first).

The workflow runs every 6 hours UTC and sends only during active **language invasion** windows (see `languageInvasionSystem.ts`). Notifications deep-link to `/home?anomaly=<invasion-id>`.

Local send (requires service role + VAPID env):
```bash
PUSH_DRY_RUN=true npm run push:send
```

## Mobile QA checklist (listening + encounters)

- [ ] **iOS PWA push**: Add to Home Screen → open from icon → allow invasion alerts on prompt
- [ ] Safe-area: header and hunt focus mode clear notch/home indicator
- [ ] **Listening contract**: Receive signal → TTS plays after tap; replay limit shown
- [ ] **Hunt mode**: `EncounterFocusShell` fullscreen; Exit focus returns to board
- [ ] **Speech**: Mic permission on first tap (`npm run dev:mobile` for LAN HTTPS)
- [ ] **Dungeon**: Sector flow, extraction ceremony, unlock toast after extract
- [ ] Penalties: high corruption reduces wrong-attempt budget (HUD + encounter copy)

## Manifest

- [`src/app/manifest.ts`](../src/app/manifest.ts) — `standalone`, theme `#05070b`, start `/home`
- Icons: [`public/icons/icon.svg`](../public/icons/icon.svg), dynamic `/icon` route
