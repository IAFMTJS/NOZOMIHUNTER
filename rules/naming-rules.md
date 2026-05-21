# Naming Rules

Consistency is mandatory.

AI-generated inconsistency destroys large projects over time.

---

# Components

Use PascalCase.

GOOD:
- QuestCard.tsx
- DungeonHUD.tsx
- XPBar.tsx

BAD:
- questcard.tsx
- dungeon_hud.tsx

---

# Hooks

Must start with use.

GOOD:
- usePlayer.ts
- useDungeon.ts
- useQuestLogic.ts

BAD:
- playerHook.ts
- dungeonLogic.ts

---

# Systems

Use camelCase + System suffix.

GOOD:
- progressionSystem.ts
- dungeonSystem.ts
- penaltySystem.ts

BAD:
- Progression.ts
- dungeonLogic.ts

---

# Services

Use action-focused naming.

GOOD:
- generateDialogue.ts
- analyzeSpeech.ts
- detectEmotion.ts

BAD:
- openaiStuff.ts
- helper.ts

---

# Types

Use PascalCase.

GOOD:
- Player
- DungeonEncounter
- QuestReward

BAD:
- playerType
- quest_interface

---

# Constants

Use UPPER_SNAKE_CASE.

GOOD:
- MAX_LEVEL
- XP_MULTIPLIER

BAD:
- maxLevel
- xpMultiplier

---

# Files

File names must reflect exact responsibility.

Avoid:
- utils.ts
- helper.ts
- random.ts

Every file should have a clear purpose.

---

# Boolean Naming

Must sound like true/false questions.

GOOD:
- isCompleted
- hasPenalty
- canEnterDungeon

BAD:
- completed
- penaltyState

---

# Event Names

Use uppercase snake case.

GOOD:
- QUEST_COMPLETED
- LEVEL_UP
- SPEECH_ANALYZED

---

# Database Naming

Use snake_case.

GOOD:
- player_stats
- dungeon_runs
- speech_attempts

---

# Folder Naming

Use lowercase.

GOOD:
- progression
- dungeons
- multiplayer

BAD:
- DungeonSystem
- PlayerStuff

---

# General Philosophy

Code should be readable without explanation.

If naming requires explanation:
rename it.