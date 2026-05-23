# Release checklist (v1.1 remediation)

1. Login → `/home` → request contract → `/prepare` → deploy → complete → reward overlay → claim
2. Dungeon enter (stamina) → sector → extract → pending rewards
3. Track contract on `/contracts/[id]`
4. Brew on `/vocabulary`
5. `/missions` redirects to `/contracts`; `/stats` shows RPG bars; `/records` and `/settings` load
6. Apply migration `010_rpg_stats.sql` via `npm run db:push`
7. Listening encounter: focus shell, tap to stop while signal plays
8. Mobile mic on `npm run dev:mobile`
9. PWA opens `/home`
10. `npm run typecheck` and `npm run test` pass
11. Migrations `007`–`010` via `npm run db:push`
