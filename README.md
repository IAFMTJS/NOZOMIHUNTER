# README.md

# NOZOMI - Hunter System

NOZOMI is an immersive Japanese-learning RPG inspired by:
- oldschool MMORPG progression
- Solo Leveling progression systems
- Persona-style atmosphere
- Monster Hunter preparation loops

Language learning is integrated into gameplay systems.

The player improves Japanese through:
- quests
- dungeons
- speech encounters
- AI conversations
- progression systems

---

# Core Philosophy

NOZOMI is NOT:
- a productivity app
- a flashcard app
- a generic educational platform

NOZOMI IS:
- a mastery-driven RPG
- a persistent progression ecosystem
- an immersive gameplay experience

---

# Architecture Philosophy

The project follows:
- modular systems
- event-driven architecture
- strict TypeScript
- feature-based structure
- scalable gameplay systems

Gameplay logic NEVER belongs inside React components.

---

# Main Stack

## Frontend
- Next.js
- TypeScript
- TailwindCSS
- Framer Motion

## Backend
- **Supabase** — auth (Google + guest), PostgreSQL, Realtime

## Dialogue & speech (free)
- Rule-based dialogue orchestrator (no paid LLM)
- Web Speech API for STT where supported (no Whisper/OpenAI)

---

# Folder Structure

```txt
/src          — Next.js app, features, systems, services, stores
/contracts    — TypeScript data contracts
/rules        — Architecture and gameplay rules
/flows        — System flow documentation
/prompts      — Cursor AI prompts
/docs         — Live documentation
/supabase     — SQL migrations
```

Run locally: `npm install` → copy `.env.example` to `.env.local` → apply migration → `npm run dev`

Auth test paths:
- Email / Google are the default local sign-in paths
- Guest sign-in is hidden unless `NEXT_PUBLIC_ENABLE_GUEST_AUTH=true`
- If guest is enabled, Supabase anonymous auth must also be enabled in your project

---

# Development Workflow

Before implementing features:
1. Read rules
2. Read contracts
3. Read flows
4. Analyze existing systems
5. Detect duplicates
6. Preserve architecture consistency

After implementation:
1. Update documentation
2. Update contracts
3. Update flows
4. Update changelog

---

# Core Gameplay Loop

Login
↓
Receive Quest
↓
Enter Encounter
↓
Use Japanese
↓
Gain XP
↓
Level Up
↓
Unlock Systems
↓
Repeat

---

# Long-Term Goal

Create a scalable immersive RPG ecosystem where:
- mastery feels meaningful
- progression feels earned
- immersion remains central
- systems remain scalable
 :::writing{variant="standard" id="h5a1e2"} # feature-example.md  # Feature Example Architecture  ## Folder Structure txt
/features/exampleFeature
  /components
  /hooks
  /services
  /utils
  /types
  index.ts
 ---  # Responsibilities  ## Components UI only.  Allowed: - rendering - animations - interactions  Forbidden: - gameplay logic - XP calculations - database logic  ---  ## Hooks Feature orchestration.  Examples: - useFeatureLogic - useFeatureState  ---  ## Services External communication only.  Examples: - Supabase calls - AI requests  ---  ## Utils Pure helper logic.  Must remain reusable.  ---  ## Types Feature-specific TypeScript types.  ---  # Rules  Features must: - remain isolated - remain modular - avoid direct cross-feature mutations - use contracts where possible - use events for communication  ---  # Example Flow  Component ↓ Hook ↓ System ↓ Event Bus ↓ Store Update ↓ UI Refresh

:::writing{variant="standard" id="u9n4kd"}
# store-example.md

# Zustand Store Example

ts import { create } from "zustand"  interface PlayerStore {   level: number   xp: number   rank: string    addXP: (amount: number) => void   setRank: (rank: string) => void }  export const usePlayerStore = create<PlayerStore>(   (set) => ({     level: 1,     xp: 0,     rank: "E",      addXP: (amount) =>       set((state) => ({         xp: state.xp + amount       })),      setRank: (rank) =>       set(() => ({         rank       }))   }) ) 

---

# Store Rules

Stores:
- manage centralized state
- contain minimal business logic
- remain typed
- remain modular

Stores should NOT:
- directly call APIs
- contain heavy gameplay systems
- mutate unrelated systems
 :::writing{variant="standard" id="p2f8ls"} # system-example.md  # System Example ts
import { PlayerContract } from "@/contracts/player-contract"

interface RewardResult {
  xpGained: number
  leveledUp: boolean
}

export function rewardXP(
  player: PlayerContract,
  amount: number
): RewardResult {

  const updatedXP = player.xp + amount

  const requiredXP =
    player.level * 100

  const leveledUp =
    updatedXP >= requiredXP

  return {
    xpGained: amount,
    leveledUp
  }
}
 ---  # System Rules  Systems: - contain gameplay logic - remain framework-independent - remain reusable - remain testable  Systems should: - avoid UI logic - avoid direct DB access - avoid duplicated calculations  Systems communicate through: - events - stores - contracts

:::writing{variant="standard" id="m4t9wx"}
# component-example.md

# Component Example

tsx interface XPBarProps {   currentXP: number   requiredXP: number }  export function XPBar({   currentXP,   requiredXP }: XPBarProps) {    const percentage =     (currentXP / requiredXP) * 100    return (     <div className="w-full h-4 bg-black rounded">       <div         className="h-full rounded"         style={{           width: `${percentage}%`         }}       />     </div>   ) } 

---

# Component Rules

Components:
- render visuals
- trigger actions
- remain presentation-focused

Components should NEVER:
- calculate XP
- determine rewards
- contain progression systems
- contain database logic
 :::writing{variant="standard" id="z8r2qm"} # ai-pipelines.md  # AI Pipelines  ## Intent Pipeline  Player Message ↓ Normalization ↓ Intent Detection ↓ Confidence Validation ↓ Context Classification ↓ Response Routing  ---  ## Emotion Pipeline  Message Input ↓ Tone Analysis ↓ Behavior Pattern Detection ↓ Emotional Classification ↓ Adaptive Response Weighting  ---  ## Vocabulary Pipeline  Conversation ↓ Word Extraction ↓ Known Vocabulary Check ↓ Weakness Detection ↓ Mastery Tracking ↓ Reward Calculation  ---  ## Memory Pipeline  Conversation ↓ Relationship Updates ↓ Memory Prioritization ↓ Decay Validation ↓ Persistent Storage  ---  ## Adaptive Difficulty Pipeline  Player Performance ↓ Weakness Detection ↓ Stress Analysis ↓ Difficulty Scaling ↓ Encounter Adaptation  ---  # AI Philosophy  The AI should: - maintain immersion - adapt dynamically - reinforce progression - avoid robotic tutoring behavior  The AI should NEVER: - sound corporate - over-explain - spam motivation - break atmosphere

:::writing{variant="standard" id="f7v1qa"}
# onboarding.md

# Onboarding Philosophy

## Core Principle

The player must never feel overwhelmed.

Complexity unlocks gradually.

---

# Early Experience Goals

The first hour should:
- establish immersion
- establish progression
- establish curiosity
- establish momentum

---

# Tutorial Philosophy

Tutorials should:
- feel integrated
- feel natural
- feel atmospheric

Avoid:
- giant text walls
- corporate explanations
- excessive handholding

---

# First Progression

The player should:
- gain XP quickly
- complete a simple quest quickly
- unlock something meaningful quickly

This creates:
- momentum
- investment
- curiosity

---

# Unlock Structure

Systems unlock gradually:
1. basic quests
2. dialogue systems
3. speech systems
4. dungeons
5. advanced systems
6. multiplayer

---

# Onboarding Atmosphere

The onboarding should feel:
- mysterious
- exciting
- immersive

Not:
- educational
- tutorial-heavy
- productivity-focused
```