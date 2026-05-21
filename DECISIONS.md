# NOZOMI Decision Log

## Stack

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js 15 App Router | Roadmap, Vercel, RSC |
| Language | TypeScript strict | Architecture rules |
| Styling | Tailwind CSS v4 | Fast dark UI |
| State | Zustand | Centralized player state |
| Backend | Supabase | Auth, Postgres, Realtime later |
| Validation | Zod | Runtime boundaries |
| AI (Phase 2+) | OpenAI API | Dialogue, intent, emotion |
| Speech (Phase 4+) | Whisper | STT pipeline |

## Auth

| Decision | Choice |
|----------|--------|
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
