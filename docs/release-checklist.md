# Release checklist (v1.1 remediation)

1. Login → `/home` → request contract → `/prepare` → deploy → complete → reward overlay → claim
2. Dungeon enter (stamina) → sector → extract → pending rewards
3. Track contract on `/contracts/[id]`
4. Brew on `/vocabulary`
5. `/missions` and `/stats` legacy redirects work
6. Mobile mic on `npm run dev:mobile`
7. PWA opens `/home`
8. `npm run typecheck` and `npm run test` pass
9. Apply migrations `007`–`009` via `npm run db:push` (only one file per version number; `008` = shop, `009` = unlock key rename)
