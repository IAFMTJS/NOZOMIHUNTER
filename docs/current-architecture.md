# Current Architecture

Last updated: v0.1.0 — Sprint 0 + Phase 1 complete + Phase 2–6 scaffolds

## Implemented

| Layer | Status |
|-------|--------|
| Next.js App Router | Yes |
| Folder structure | Yes |
| Contracts | `/contracts` |
| Event bus | `src/systems/events` |
| Auth (Google + guest) | Yes |
| DB migration 001 | Yes |
| Progression systems | Yes |
| Player store | Yes |
| Quest system (MVP) | Yes |
| Save system | Yes |
| Dashboard | Yes |
| AI (Phase 2 scaffold) | Scaffold |
| JMDict (Phase 3 scaffold) | Scaffold |
| Speech (Phase 4 scaffold) | Scaffold |
| Dungeons (Phase 5 scaffold) | Scaffold |
| Multiplayer (Phase 6 scaffold) | Scaffold, flags off |

## Folder map

```txt
/contracts
/rules
/flows
/prompts
/docs
/supabase/migrations
/src/app
/src/features/{auth,quests}
/src/systems/{events,progression,quests,save,antiExploit,ai,mastery,speech,dungeons}
/src/services/{supabase,openai,whisper,jmdict}
/src/stores
/src/config
```

## Core loop

Login → Quest → XP → Level Up → Save (Supabase)

## Environment

See `.env.example` and `DECISIONS.md` for OAuth redirect URLs.
