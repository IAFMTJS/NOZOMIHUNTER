# Architecture Rules

## Core Philosophy

This project follows a strict separation between:
- UI
- Features
- Gameplay systems
- External services
- State management

The architecture must remain scalable, modular, and AI-friendly.

---

# Absolute Rules

## 1. Never place gameplay logic inside React components

BAD:
- XP calculations inside components
- Penalty calculations inside components
- Dungeon logic inside components

GOOD:
Components call systems.

Example:
QuestCard.tsx
→ questSystem.ts
→ progressionSystem.ts

---

## 2. Systems must remain framework independent

Systems:
- must not depend on React
- must not depend on UI
- must be reusable
- must be pure where possible

Systems should work independently from rendering.

---

## 3. Features must remain domain isolated

Features may not directly manipulate other feature internals.

Communication between systems must happen through:
- stores
- services
- events
- contracts

---

## 4. All database access goes through services

Never directly call Supabase inside:
- components
- systems

Only services may communicate with external APIs/databases.

---

## 5. All gameplay calculations must go through systems

Examples:
- XP
- rewards
- penalties
- dungeon scaling
- speech scoring
- mastery tracking

Must always use dedicated systems.

---

## 6. State management must remain centralized

Use Zustand stores for:
- player state
- dungeon state
- quests
- settings
- multiplayer state

Never duplicate global state.

---

## 7. Components must remain presentation-focused

Components:
- display data
- trigger actions
- handle visuals

They must not contain business rules.

---

## 8. Avoid massive files

Target:
- 150-250 lines per file
- split logic aggressively

AI loses consistency in very large files.

---

## 9. Use event-driven architecture where possible

Examples:
- QUEST_COMPLETED
- LEVEL_UP
- PENALTY_TRIGGERED
- DUNGEON_ENTERED

Gameplay orchestration may call systems directly. Emitted events are consumed by
`analyticsSystem` (telemetry buffer) and logging — do not assume every handler
re-runs game logic.

Avoid tightly coupled systems.

---

## 10. TypeScript is mandatory everywhere

No untyped logic.
No any abuse.
No implicit unknown structures.

Types are contracts.

---

# Folder Responsibilities

/components
→ reusable UI only

/features
→ feature-specific logic/UI

/systems
→ pure gameplay logic

/services
→ external integrations

/stores
→ global state

/hooks
→ reusable hooks

/contracts
→ shared data contracts

---

# Scalability Philosophy

Every feature added must:
- strengthen progression
- strengthen immersion
- strengthen gameplay loops

Avoid feature creep.

No system exists "because it sounds cool."