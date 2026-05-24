# NOZOMI Decision Log

## Stack

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js 15 App Router | Roadmap, Vercel, RSC |
| Language | TypeScript strict | Architecture rules |
| Styling | Tailwind CSS v4 | Fast dark UI |
| State | Zustand | Centralized player state |
| Backend | Supabase | Auth, Postgres, Realtime — **only required external service** |
| Validation | Zod | Runtime boundaries |
| Dialogue (Phase 2+) | Local rule-based orchestrator | No paid LLM APIs |
| Speech (Phase 4+) | MediaRecorder + browser STT + typed fallback | Free browser path only — no OpenAI / Whisper |

## Paid APIs

**None.** Do not add OpenAI, Anthropic, or other metered AI APIs. Speech uses browser STT + typed fallback only.

## Auth

| Decision | Choice |
|----------|--------|
| Provider | **Supabase Auth only** |
| Google login | Supabase OAuth |
| Guest mode | Supabase anonymous sign-in |
| Session | `@supabase/ssr` cookies |

## Challenge display (v1.3.1)

| Decision | Choice |
|----------|--------|
| Masking vs reveal | Systems resolve layers; UI uses `EncounterDisplayProvider` + brief local reveal animation after correct |
| Answer validation | `answerValidationSystem` shared by vocab and listening |
| Wrong-answer penalty | +1 corruption per wrong (not encounter fail); tutorial exempt |

## Architecture

| Decision | Choice |
|----------|--------|
| Gameplay logic | `/src/systems` only — never in React components |
| DB access | `/src/services/supabase` only |
| Contracts | `/contracts` — no logic, no React |
| Events | `eventBus` + `GAME_EVENTS` |
| Multiplayer | Feature flags off until Phase 6 |

## Completion & economy (v1.0 audit)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Post-completion sync | `completionService` + `loadPlayer` | Avoid double-merging credits; dungeon and missions share one path |
| Completion boosts | Server `complete_quest_guarded` (013) | Client preview only; prevents boost waste from RPC cap |
| Shop rotation hash | `shopRotationHash.ts` + SQL `nozomi_shop_hash` | Golden vectors in `tests/shopRotationHash.test.ts`; keep in sync |
| Hidden objectives | Excluded from `canCompleteQuest` + RPC | Flavor objectives must not block extraction |
| Dungeon enter | `assignQuest` then `spend_stamina_guarded` | Roll back quest row if stamina spend fails |
| Stamina unlock check | `unlocked_dungeons @> jsonb_build_array(key)` | `progression.unlocked_dungeons` is a JSON array |

## Redirect URLs (Supabase Auth)

- Local: `http://localhost:3000/auth/callback`
- Production: `https://<your-domain>/auth/callback`

## Updates 2405 (v1.2.3)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Daily contracts | `DAILY` tier + `daily-{playerId}-{date}` id | One maintenance slot per UTC day; separate from Side pool |
| Side rewards | `buildQuestRewards(level, "SIDE")` on channel | Avoid MAIN-tier XP on Side requests |
| New-player bootstrap | Hydrate merges empty `unlocked_dungeons`; migration 014 grants starter inventory | Prevent dungeon/prepare softlock |
| Listening integrity | `heardOnce` gate; skip blocked on LISTENING | Language learning requires audio |
| Learner display | `LearnerWordLine` + `rules/learner-display-rules.md` | Japanese + romaji + meaning everywhere |
| Training drills | `hidden: true`, id prefix `training-`, excluded from catalog | Repeatable grind without polluting Daily tab |
