# Mobile PWA — Hunter Client

NOZOMI can be installed as a lightweight PWA. Offline support is **shell-only**; auth, quests, and saves require network (Supabase).

## Install

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

Test locally:

```bash
npm run build
npm run start
```

## Mobile QA checklist (listening + encounters)

- [ ] Install or Add to Home Screen; app opens to dashboard shell
- [ ] Safe-area: header and hunt focus mode clear notch/home indicator
- [ ] **Listening contract**: Receive signal → TTS plays after tap; replay limit shown
- [ ] **Hunt mode**: `EncounterFocusShell` fullscreen; Exit focus returns to board
- [ ] **Speech**: Mic permission on first tap (`npm run dev:mobile` for LAN HTTPS)
- [ ] **Dungeon**: Sector flow, extraction ceremony, unlock toast after extract
- [ ] Penalties: high corruption reduces wrong-attempt budget (HUD + encounter copy)

## Manifest

- [`src/app/manifest.ts`](../src/app/manifest.ts) — `standalone`, theme `#05070b`, start `/home`
- Icons: [`public/icons/icon.svg`](../public/icons/icon.svg), dynamic `/icon` route
