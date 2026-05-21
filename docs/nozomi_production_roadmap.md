# NOZOMI: Production Roadmap & Vibecoding System Guide

## 1. Why this document exists

This is the point where the project stops being a collection of cool ideas and becomes a real production roadmap.

If you do not structure it properly, the result is usually:
- 48 screenshots
- 900 concepts
- 0 working gameplay loop

That is the classic indie-dev necromancy circle.

This document keeps the project grounded in actual implementation order, clean architecture, and AI-friendly structure.

---

## 2. Project vision

### Working title
**NOZOMI: HUNTER SYSTEM**

An oldschool RPG / MMO-inspired Japanese learning ecosystem where:

- language = gameplay
- progression = character growth
- quests = learning loops
- dungeons = scenario mastery
- raids = multiplayer communication
- AI = dungeon director + companion

### Core philosophy

This is **not** a learning app.

It is a **persistent progression game**.

That means the project is built around:

- systems
- loops
- mastery
- immersion
- progression

Not around:

- lessons
- quiz machines
- flashcards

---

## 3. Tech stack

### Frontend
**Next.js**

Why:
- perfect with Vercel
- React ecosystem
- fast iteration
- mobile responsive
- future app conversion possible

**TailwindCSS**

For:
- fast UI systems
- theme consistency
- dark UI perfection

**Framer Motion**

For:
- immersive transitions
- UI feedback
- atmospheric movement

### Backend
**Supabase**

Use for:
- auth
- PostgreSQL database
- realtime features
- storage
- edge functions

### AI stack
**Whisper**

For:
- speech recognition
- pronunciation analysis
- speech quests

**OpenAI API / local LLM hybrid later**

For:
- dialogue generation
- adaptive quests
- emotion detection
- intent recognition
- dungeon AI

### Data
**JMDict**

Pipeline:

JMDict XML  
→ parser  
→ normalized JSON  
→ Supabase tables  
→ search / index layer

Keep the data scope limited to:
- Japanese
- Romaji
- English

That keeps the system scalable.

---

## 4. GitHub structure

```txt
/nozomi
├── /src
│   ├── /app
│   ├── /components
│   ├── /features
│   ├── /systems
│   ├── /services
│   ├── /stores
│   ├── /hooks
│   ├── /types
│   ├── /constants
│   ├── /config
│   ├── /data
│   ├── /assets
│   ├── /styles
│   └── /lib
├── /rules
├── /prompts
├── /flows
├── /contracts
├── /examples
├── /docs
├── /tests
├── /templates
├── /content
├── /scripts
├── /.github
└── root config files
```

---

## 5. Development phases

# Phase 1: Foundation

### Goal
Build the first working core loop.

Do **not** focus on beauty or perfection yet.

The first playable loop should be:

Login → Quest → XP → Level up → Save stats

### Phase 1 build order

#### 1. Auth system
Use:
- Supabase auth
- Google login
- guest mode

#### 2. Database schema
Create:
- users
- stats
- quests
- learned_words
- conversations
- progression

#### 3. XP + leveling system
Core gameplay systems:
- XP rewards
- levels
- ranks
- progression curves
- unlock system

#### 4. Quest system
MVP quest types:
- vocabulary
- conversation
- listening
- survival

### Cursor prompt for progression system

```md
You are a senior MMORPG systems engineer.

Build a scalable RPG-style progression engine for a Japanese learning platform.

Requirements:
- XP system
- leveling system
- rank system (E to S rank)
- progression curves
- unlockable features
- stat tracking
- quest rewards
- anti-exploit protections

The architecture must:
- be modular
- use TypeScript
- support Supabase
- support future multiplayer systems
- separate gameplay logic from UI

Generate:
1. folder structure
2. TypeScript architecture
3. interfaces/types
4. progression formulas
5. example code
6. scalable design decisions
7. anti-spam reward logic

Write production-level code only.
```

### Cursor prompt for quest system

```md
You are a lead game systems designer.

Design a procedural quest engine for an immersive Japanese learning RPG.

Requirements:
- dynamic quest generation
- adaptive difficulty
- XP rewards
- failure states
- penalties
- daily quests
- dungeon quests
- conversation quests
- listening quests

The system must:
- scale infinitely
- avoid repetitive content
- use player weakness tracking
- integrate with vocabulary mastery
- support hidden quest triggers

Generate:
- architecture
- data models
- generation logic
- reward balancing
- failure balancing
- TypeScript examples
- Supabase integration structure
```

---

# Phase 2: AI + conversation core

Only add AI after the core loop works.

Otherwise you get AI spaghetti.

### Build:
1. intent detection  
2. emotion detection  
3. dialogue memory  
4. vocabulary tracking  
5. adaptive responses  

### Cursor prompt for AI conversation system

```md
You are an AI conversation architect designing an immersive Japanese learning system.

Build a conversational AI architecture that:
- detects user intent
- detects emotional tone
- tracks vocabulary mastery
- tracks grammar weaknesses
- adapts responses dynamically
- supports Japanese, romaji, and English
- generates immersive RPG-style interactions

Requirements:
- modular AI pipeline
- memory persistence
- adaptive difficulty
- contextual responses
- dialogue progression
- response scoring
- future multiplayer compatibility

Generate:
- architecture
- flow diagrams
- database models
- prompt engineering structure
- TypeScript implementation examples
- scalable memory system
```

---

# Phase 3: JMDict engine

Now build vocabulary mastery.

### Build:
- parser
- indexing
- search
- frequency system
- mastery tracking

### Cursor prompt for JMDict engine

```md
You are a linguistic systems engineer.

Build a scalable JMDict processing engine for a Japanese learning RPG platform.

Requirements:
- parse JMDict XML
- normalize Japanese, romaji, and English data
- frequency prioritization
- JLPT tagging
- vocabulary indexing
- fast search
- mastery tracking
- future AI integration

Generate:
- parser architecture
- database schema
- optimized indexing strategy
- TypeScript implementation
- Supabase storage strategy
- performance optimization
```

---

# Phase 4: Whisper + audio

Now build speaking mechanics.

### Build:
- STT pipeline
- pronunciation scoring
- speech quests
- confidence detection

### Cursor prompt for speech system

```md
You are a speech systems engineer.

Build a speech analysis pipeline using Whisper for a Japanese learning RPG platform.

Requirements:
- speech-to-text
- pronunciation analysis
- hesitation detection
- response timing
- confidence scoring
- quest integration
- XP reward integration

Generate:
- architecture
- processing pipeline
- scoring logic
- latency optimization
- TypeScript examples
- scalable backend design
```

---

# Phase 5: Dungeon system

Now the game starts to feel real.

### Build:
- dungeon templates
- procedural events
- branching paths
- encounter system
- boss system

### Cursor prompt for dungeon system

```md
You are a senior MMORPG dungeon systems designer.

Design a scalable dungeon engine for an immersive Japanese learning RPG.

Requirements:
- procedural dungeon events
- branching paths
- vocabulary encounters
- grammar bosses
- listening encounters
- multiplayer raid support
- adaptive difficulty
- penalty systems
- hidden events
- persistent progression

The dungeon system must feel like an oldschool MMORPG progression system.

Generate:
- architecture
- gameplay loop
- data structures
- event generation system
- scaling logic
- multiplayer considerations
- TypeScript examples
```

---

# Phase 6: Multiplayer + raids

This must come last.

Why?
Because multiplayer is:
- synchronization hell
- debugging hell
- scaling hell

First make singleplayer perfect.

---

## 6. Exact build order for the first playable version

The most important rule is to build **systems**, not screens.

Start with:
- progression logic
- gameplay loops
- database structure
- quest engine

Only after that:
- polish
- effects
- visuals

Strong systems with simple visuals work.
Beautiful visuals without systems die immediately.

### First code targets
1. Auth
2. Player store
3. XP system
4. Level system
5. Quest system
6. Quest UI
7. Save state
8. Dashboard
9. Basic progression feedback

---

## 7. Project structure for vibecoding

For AI-assisted coding, the structure must be AI-proof.

### Core folders
```txt
/src
/features
/systems
/services
/stores
/components

/rules
/prompts
/contracts
/flows
/examples
/docs
```

### Why this structure works
- clear boundaries
- better AI context
- easier refactoring
- less duplicated logic
- easier maintenance

### Additional rules for vibecoding
- keep files under roughly 150 to 250 lines
- avoid giant monolithic files
- split logic aggressively
- keep systems isolated
- keep TypeScript strict
- use examples and contracts as anchors

---

## 8. Rules files

These are not optional. They keep Cursor from inventing chaos.

### /rules
```txt
architecture-rules.md
naming-rules.md
ui-rules.md
gameplay-rules.md
system-rules.md
```

### Purpose
- architecture-rules: enforce separation of concerns
- naming-rules: enforce consistency
- ui-rules: keep the interface immersive and readable
- gameplay-rules: keep gameplay meaningful and tense
- system-rules: define system behavior and boundaries

### Architecture rules summary
- never put gameplay logic inside React components
- systems must stay framework-independent
- features must remain domain isolated
- database access must go through services
- all gameplay calculations must go through systems
- state management must be centralized
- components must stay presentation-focused
- avoid massive files
- use event-driven architecture where possible
- TypeScript is mandatory everywhere

---

## 9. Prompt files

These are your AI operating system.

### /prompts
```txt
progression-prompts.md
dungeon-prompts.md
ai-prompts.md
speech-prompts.md
ui-prompts.md
```

### Purpose
Each prompt file is a reusable instruction set for Cursor.

#### progression-prompts.md
Use for XP, levels, ranks, progression curves, unlocks, penalties.

#### dungeon-prompts.md
Use for dungeon generation, encounters, bosses, raid architecture.

#### ai-prompts.md
Use for AI conversation, adaptive behavior, memory, intent/emotion analysis.

#### speech-prompts.md
Use for Whisper, STT, pronunciation, hesitation, confidence scoring.

#### ui-prompts.md
Use for layout, HUD, readability, immersion, motion, polish.

---

## 10. Contract files

Contracts are the truth layer of the project.

### /contracts
```txt
player-contract.ts
quest-contract.ts
dungeon-contract.ts
ai-contract.ts
speech-contract.ts
event-contract.ts
multiplayer-contract.ts
```

### Purpose
Contracts define:
- object shape
- field names
- system expectations
- boundaries between layers

### Contract rules
- no business logic
- no React imports
- no database queries
- only structure and truth

### Why contracts matter
They stop AI from inventing extra fields, duplicated structures, and conflicting models.

---

## 11. Event architecture

The project should be event-driven.

### /systems/events
```txt
eventBus.ts
eventTypes.ts
eventHandlers.ts
eventRegistry.ts
```

### Core event examples
- QUEST_COMPLETED
- LEVEL_UP
- PENALTY_TRIGGERED
- DUNGEON_ENTERED
- SPEECH_ANALYZED

### Why events matter
Without events, everything becomes tightly coupled.
With events, systems can react cleanly:
- progression reacts
- rewards react
- UI reacts
- analytics reacts

---

## 12. Config files

### /config
```txt
progressionConfig.ts
dungeonConfig.ts
speechConfig.ts
penaltyConfig.ts
```

### Purpose
Keep all important tunables out of the code.

Examples:
- base XP
- level multiplier
- max level
- penalty intensity
- dungeon scaling
- speech thresholds

---

## 13. Feature flags

### /config/features.ts
Use feature flags to control unstable or unfinished systems.

Example:
```ts
export const FEATURES = {
  MULTIPLAYER: false,
  VOICE_CHAT: false,
  RAID_SYSTEM: false
}
```

### Why this matters
You can keep incomplete systems turned off without breaking the whole codebase.

---

## 14. Logging, errors, validation

These are survival tools.

### /systems/logger
For gameplay and debug events.

### /systems/errors
For consistent app errors.

### /systems/validation
Use Zod for runtime validation.

### Why these matter
AI-generated code often looks correct and still breaks in production.
Validation is the shield against that.

---

## 15. Save system

Do not ignore save architecture.

### /systems/save
Should support:
- autosave
- rollback
- recovery
- checkpoint logic

### Save examples
- dungeon progress
- conversation memory
- penalties
- active quests
- unlocked content

---

## 16. Anti-exploit system

XP systems get abused.

### /systems/antiExploit
Track:
- XP farming
- speech spam
- macro behavior
- repeated exploit loops

### Why this matters
If the system gives rewards, somebody will try to break it.
That is not pessimism. That is gaming culture.

---

## 17. Analytics

Do not treat analytics as corporate nonsense.
Treat it as gameplay telemetry.

### /systems/analytics
Track:
- quest failure rates
- dungeon abandonment
- ragequit moments
- difficult grammar patterns
- speech drop-off points

This is how you balance the game properly.

---

## 18. Tutorial system

The game is deep.
The onboarding must be deliberate.

### /systems/tutorial
Use:
- guided first quest
- small early reward
- slow unlocks
- explanation only when necessary

The first-time experience must not feel like a submarine control panel.

---

## 19. NPC memory and audio

### NPC memory
Use it to make NPCs persistent:
- relationships
- previous encounters
- failures
- trust
- emotional state

### Audio
Audio is a major part of immersion:
- ambient layers
- dungeon themes
- tension layers
- corruption audio
- UI sounds

---

## 20. State machines

Use state machines for:
- quests
- dungeons
- dialogue
- bosses
- AI behavior
- raid states

This prevents messy transitions and weird edge cases.

---

## 21. Content templates

### /templates
```txt
quest-template.json
dungeon-template.json
npc-template.json
boss-template.json
```

Templates are how you make AI-generated content consistent.

---

## 22. Content pipeline

### /content
This is where world content lives:
- NPCs
- lore
- dungeon text
- scripted events
- story arcs

This should stay separate from systems.

---

## 23. Documentation strategy

The project should not rely on memory alone.

### Must-have docs
```txt
/docs/current-architecture.md
/docs/system-registry.md
/docs/core-philosophy.md
/docs/game-design-document.md
/docs/core-loop.md
/docs/economy.md
/docs/failure-design.md
/docs/state-machines.md
/docs/lore-bible.md
/docs/balancing.md
/docs/ai-pipelines.md
/docs/dungeon-design.md
```

### Why live documentation matters
Cursor and any AI assistant will forget previous decisions.
Documentation acts as external memory.

---

## 24. Decision log

### DECISIONS.md
Keep a simple decision log with choices like:
- using Supabase instead of Firebase
- using feature-based architecture
- keeping gameplay logic outside React
- using Whisper for speech analysis
- using Zustand for global state

This prevents AI from reopening decisions that were already made.

---

## 25. Cursor workflow for every new chat

Every new Cursor session should start by reading:

- /rules
- /contracts
- /flows
- /docs/current-architecture.md
- /docs/core-philosophy.md
- /docs/system-registry.md
- DECISIONS.md

Only after that should it generate code.

### Better session prompt
```md
Before starting:

1. Read all architecture rules
2. Read current architecture documentation
3. Read system registry
4. Read contracts
5. Read flows
6. Read core philosophy
7. Analyze existing systems
8. Detect existing patterns
9. Follow all established architecture decisions

Do not introduce:
- duplicate systems
- duplicate logic
- conflicting architecture
- inconsistent naming
- gameplay logic inside components

Preserve:
- immersion philosophy
- progression philosophy
- modular architecture
- event-driven systems

After analysis, summarize your understanding of the current architecture before generating code.
```

---

## 26. Master session prompt

Create a reusable master prompt for all future Cursor sessions.

### /prompts/master-session-prompt.md
It should instruct Cursor to:
- read architecture rules
- read naming rules
- read gameplay philosophy
- read contracts
- read current architecture
- read system registry
- analyze existing systems
- preserve architecture consistency
- avoid duplicate logic
- avoid oversized files
- use strict TypeScript
- follow feature-based architecture
- keep systems modular
- update docs after coding

---

## 27. Why all of this matters

The biggest danger in vibecoding is not speed.
It is drift.

Drift happens when:
- architecture changes without documentation
- features get duplicated
- prompt context is lost
- systems become inconsistent
- AI fills the gaps with random assumptions

This document, plus the rules, prompts, contracts, flows, and live documentation, is the method for preventing that.

---

## 28. Final implementation priority

If you want the project to survive, build in this order:

1. architecture rules
2. contracts
3. master prompt
4. current architecture docs
5. player store
6. auth
7. XP system
8. level system
9. quest system
10. dashboard UI
11. save system
12. AI conversation core
13. JMDict engine
14. Whisper integration
15. dungeon engine
16. multiplayer raids
17. balancing and analytics
18. content pipeline
19. polishing and atmosphere

---

## 29. Final principle

Build systems, not screens.

Strong systems with simple visuals work.
Beautiful visuals without systems die.

That is the core of the project.
