# Current Architecture

Last updated: v0.6.0 — Phase 5 dungeon system

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
| Quest system (vocabulary + conversation encounters) | Yes |
| AI conversation (rule-based director) | Yes |
| Conversation memory (Supabase) | Yes |
| Penalty system | Yes |
| Tutorial / onboarding quest | Yes |
| Save system | Yes |
| Dashboard | Yes |
| JMDict engine (parser, index, search, frequency, mastery) | Yes |
| Speech (STT hook, scoring pipeline, speech quests) | Yes |
| Dungeons (Neon Corridor, multi-sector + boss) | Yes |
| Listening encounters (dungeon sectors) | Yes |
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
/src/features/{auth,quests,conversation,speech,dungeons}
/src/systems/{events,progression,quests,penalties,tutorial,save,antiExploit,ai,mastery,speech,dungeons}
/src/services/{supabase,dialogue,speech,jmdict}
/src/hooks/useBrowserSpeech.ts
/src/stores
/src/config
```

## Core loop

Login → Quest or Dungeon → Encounter → XP → Level Up → Save (Supabase)

Dungeon loop: Enter → Deploy → Sectors (vocab, listening, NPC, speech) → Boss → Extract

## Environment

See `.env.example` and `DECISIONS.md` for OAuth redirect URLs.
