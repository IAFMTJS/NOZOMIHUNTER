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

## Architecture

| Decision | Choice |
|----------|--------|
| Gameplay logic | `/src/systems` only — never in React components |
| DB access | `/src/services/supabase` only |
| Contracts | `/contracts` — no logic, no React |
| Events | `eventBus` + `GAME_EVENTS` |
| Multiplayer | Feature flags off until Phase 6 |

## Redirect URLs (Supabase Auth)

- Local: `http://localhost:3000/auth/callback`
- Production: `https://<your-domain>/auth/callback`
