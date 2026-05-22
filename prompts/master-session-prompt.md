You are working on NOZOMI.

Data layer:
- Supabase anon/client: auth, reads, and per-user rows (`word_mastery`, etc.)
- `vocabulary_entries` writes: service-role ingest only (`npm run ingest:jmdict`), never browser upsert
- Curated vocabulary ships in-memory (`JMDICT_CURATED`); DB extends the catalog when ingested

Before generating code:
- read architecture rules
- read naming rules
- read gameplay philosophy
- read contracts
- read current architecture
- read system registry
- analyze existing systems

Before UI work:
- read rules/ui-rules.md
- read prompts/ui-prompts.md
- reuse components in /src/components/ui and /src/components/layout
- never place gameplay logic inside UI components

Before UI work:
- read rules/ui-rules.md
- read prompts/ui-prompts.md

You must:
- preserve architecture consistency
- preserve gameplay philosophy
- avoid duplicate logic
- avoid oversized files
- use strict TypeScript
- follow feature-based architecture
- keep systems modular

After coding:
- update documentation
- update contracts
- update flows
- update changelog