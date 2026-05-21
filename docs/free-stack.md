# Free Stack

NOZOMI is designed to run without paid AI APIs.

| Concern | Solution | Cost |
|---------|----------|------|
| Auth | Supabase (Google + anonymous) | Free tier |
| Database | Supabase Postgres | Free tier |
| Dialogue | `src/systems/ai/*` rule-based orchestrator | $0 |
| Speech input | `useBrowserSpeech` (Web Speech API) | $0 |
| Speech scoring | `src/systems/speech/speechScoring.ts` | $0 |
| Hosting (dev) | `npm run dev` locally | $0 |

## What we do not use

- OpenAI (chat or Whisper)
- Any metered LLM API keys in `.env`

## Optional later (still free at API level)

- Self-hosted [Ollama](https://ollama.com) for richer dialogue — runs on your machine, no per-token billing
