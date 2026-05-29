You are working on NOZOMI.

Data layer:
- Supabase anon/client: auth, reads, and per-user rows (`word_mastery`, etc.)
- `vocabulary_entries` writes: service-role ingest only (`npm run ingest:jmdict`), never browser upsert
- Curated vocabulary ships in-memory (`JMDICT_CURATED`); DB extends the catalog when ingested

Before generating code:
- read docs/Complete Game Design Document.md (or docs/game-design-document.md index)
- read architecture rules
- read naming rules
- read gameplay philosophy
- read docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md
- read rules/learner-display-rules.md
- read contracts
- read current architecture
- read system registry
- analyze existing systems

Before UI work:
- read rules/ui-rules.md
- read rules/theme-rules.md
- read prompts/ui-prompts.md
- read docs/nozomi-hunter-ui-gamefeel-progression-feedback.md
- read flows/gamefeel-ceremonies.md (when changing ceremonies or reward UX)
- read contracts/presentation-contract.ts
- reuse components in /src/components/ui and /src/components/layout
- never place gameplay logic inside UI components

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