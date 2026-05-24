# Gameplay Rules

## Japanese display (mandatory)

Any learner-facing Japanese **must** include romaji:

- Vocabulary/speech targets: kanji + romaji via `JapaneseText`
- Conversation/dialogue: inline `日本語 (romaji)` via `formatLearnerContent`
- New phrases: add readings to `PHRASE_READINGS` or `jmdictCurated` before shipping

Never show Japanese alone in the UI.

---

## Core Philosophy

This is not a productivity app.

This is a progression-based immersive RPG system where:
- language = gameplay
- mastery = progression
- failure = tension
- repetition = training
- consistency = power

The player must feel:
- growth
- risk
- immersion
- mastery
- discovery

Never reduce gameplay into:
- mindless tapping
- passive consumption
- dopamine spam

---

# Gameplay Priorities

Priority order:
1. immersion
2. progression
3. mastery
4. tension
5. rewards

---

# Progression Philosophy

Progression must:
- feel earned
- feel gradual
- feel meaningful

Avoid:
- instant gratification
- excessive rewards
- inflated progression

Leveling should never feel automatic.

---

# Mastery Philosophy

Players must improve through:
- repetition
- understanding
- adaptation
- practice

Not through:
- random guessing
- brute forcing
- passive clicking

---

# Failure Philosophy

Failure is essential.

Failure should:
- create tension
- create immersion
- encourage improvement

Failure should NOT:
- feel unfair
- feel punishing without purpose
- destroy motivation

---

# Penalty Philosophy

Penalties must:
- reinforce immersion
- reinforce consequences
- reinforce player responsibility

Penalties must never:
- permanently ruin progression
- trap players
- encourage quitting

---

# Reward Philosophy

Rewards must:
- reinforce progression
- reinforce mastery
- feel meaningful

Avoid:
- reward spam
- fake achievements
- meaningless currencies

---

# Dungeon Philosophy

Dungeons are gameplay scenarios.

They must:
- teach through context
- create tension
- require preparation
- reward mastery

Dungeons should never feel like:
- quizzes
- worksheets
- repetitive exercises

---

# Conversation Philosophy

Conversations are combat-like encounters.

Players should:
- react
- adapt
- interpret
- remember
- respond under pressure

Conversations should feel dynamic.

---

# AI Philosophy

AI exists to:
- adapt gameplay
- personalize progression
- reinforce immersion
- detect weaknesses
- create replayability

AI should never:
- over-explain constantly
- break immersion
- feel robotic
- feel like a tutor popup

---

# Hidden Systems Philosophy

Some systems should remain partially hidden.

Examples:
- hidden affinity
- hidden corruption
- hidden reputation
- hidden mastery

Discovery increases immersion.

---

# Grinding Philosophy

Grinding is allowed.

But grinding must:
- reinforce mastery
- reinforce efficiency
- reinforce familiarity

Grinding must never:
- waste time without growth
- feel mandatory forever

---

# Difficulty Philosophy

Difficulty should:
- challenge players
- reward mastery
- encourage preparation

Difficulty should NOT:
- become random
- become unfair
- become artificially inflated

---

# Player Psychology Philosophy

The player should feel:
- curious
- cautious
- invested
- immersed
- capable

The player should never feel:
- manipulated
- overwhelmed constantly
- emotionally exploited

---

# Mobile Design Philosophy

This is not a typical mobile game.

Avoid:
- casino

---

# System Differentiation

Every major mode (training, quests, dungeons, contracts, vocabulary) must trigger a **different emotion** and use **different mechanics**.

| System | Primary emotion |
|--------|-----------------|
| Training | Discipline |
| Quests | Curiosity |
| Dungeons | Stress / Survival |
| Contracts | Social pressure |
| Vocabulary | Discovery |
| Bosses | Spectacle |
| Corruption | Anxiety |
| Loot | Dopamine |
| Mastery | Pride |

Language learning lives **underneath** the systems, not above them. Disguise learning as survival, recall as combat, listening as intelligence analysis.

## Mode identity test

Before shipping any mechanic, ask:

> Would this still feel fun without the educational layer?

If not, the mechanic is weak. Prefer tension, immersion, discovery, and mastery over answer→XP repetition.

## Naming

- `/vocabulary` UI label **Threat Index** = catalog tabs (Threats / Conquered / All)
- Semantic-linking **game mode** in code = `SEMANTIC_NETWORK` (not "Threat Index")

See [`docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md`](../docs/GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md).