# Current Architecture

Last updated: v0.8.0 — unlock persistence, two dungeons, PWA, profile

## Implemented

| Layer | Status |
|-------|--------|
| Next.js App Router | Yes |
| Folder structure | Yes |
| Contracts | `/contracts` |
| Event bus + analytics buffer | `src/systems/events`, `src/systems/analytics` |
| Auth (Google + guest) | Yes |
| DB migration 001–004 | Yes (004 = `complete_quest_guarded`, `gameplay_events`) |
| Progression systems | Yes (XP via `complete_quest_guarded`; autosave uses strict `apply_guarded_progression`) |
| Player store | Yes |
| Quest system (vocabulary + conversation + speech + listening/TTS) | Yes |
| Command node hub (`ContractHub` — menu / hunt / dispatch / sector) | Yes |
| Vocabulary preparation briefing (pre-quest) | Yes |
| AI conversation (rule-based director) | Yes |
| UI kit (`Button`, `Panel`, `Input`, `EncounterFocusShell`, `EncounterTargetRail`, `EncounterFeedback`, `DungeonPhaseStepper`, `DungeonCorridorRail`) | Yes |
| Presentation (`penaltyPresentationSystem`, motion tokens, corruption/fatigue CSS) | Yes |
| Audio (`audioSystem`, Web Audio cues via event bus, mute toggle) | Yes |
| Speech (recording state machine, MediaRecorder, browser STT, mobile gesture preflight) | Yes |
| Dungeons (Neon Corridor + Shadow Archive) | Yes |
| Unlock persistence + `UNLOCK_GRANTED` | Yes (`resolveQuestCompletion`) |
| Penalty gameplay hooks | Yes (`penaltyGameplaySystem`) |
| PWA (manifest, SW, install prompt) | Yes — see `docs/mobile-pwa.md` |
| Hunter profile (`/profile`) | Yes |
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
/src/features/{auth,quests,conversation,speech,dungeons}/services (split persistence + actions + lifecycle)
/src/systems/{events,analytics,progression,quests,penalties,penaltyGameplay,tutorial,save,antiExploit,ai,mastery,vocabulary,speech,dungeons,presentation,audio,listening}
/src/config/{unlockRegistry,dungeonConfig,penaltyConfig}
/public/{icons,sw.js,audio}
/src/services/{supabase,vocabulary,speech,jmdict,dialogue}
/src/components/{ui,layout,preparation}
/src/hooks
/src/stores
/src/config
```

## Core loop

Login → Quest or Dungeon → Encounter → XP → Level Up → Save (Supabase)

## Environment

See `.env.example` and `DECISIONS.md`. Mobile dev: `npm run dev:mobile` (HTTPS on LAN). PWA install + SW: `docs/mobile-pwa.md`.
