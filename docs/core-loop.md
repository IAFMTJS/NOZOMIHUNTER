# NOZOMI Core Gameplay Loop

## Primary Gameplay Loop (mode-aware)

Login
↓
Operational feed / contract board (live system state)
↓
Choose mode by emotion (training · quest · dungeon · contract · vocabulary)
↓
Prepare (readiness, vocabulary briefing when required)
↓
Enter encounter via `GameModeId` (not generic quiz)
↓
Use Japanese in mode-specific mechanics
↓
Complete objective (pressure, corruption, timers vary by mode)
↓
Gain XP + mode-appropriate rewards
↓
Level up / unlock modes / entity capture
↓
Access harder content + live sector events
↓
Repeat

---

# Invisible Learning Principle

The player should never consciously feel: *"I am studying Japanese."*

The player should feel: *"I am surviving sectors, decoding transmissions, and evolving through dangerous encounters."*

Learning is contextualized inside each mode — not exposed as lessons.

---

# Core Loop Philosophy

The gameplay loop exists to reinforce:
- mastery
- immersion
- consistency
- tension
- long-term progression
- **mechanical differentiation** (each mode feels unique)

The player should always feel:
- forward momentum
- increasing competence
- meaningful growth
- rising challenge

---

# Progression Structure

The player progresses through:
- vocabulary mastery (entity capture: Unknown → Stabilized → Mastered)
- conversation confidence (relationship vectors in Deep Cover)
- listening comprehension (signal calibration, lost transmission)
- dungeon survival (corruption run, void pursuit, roguelike sectors)
- raid coordination (future: Dual Operator)

Language improvement IS character progression.

---

# Reward Philosophy

Rewards should:
- feel earned
- reinforce mastery
- reinforce progression
- reinforce immersion

Avoid:
- reward spam
- excessive notifications
- casino-style feedback loops

---

# Tension Philosophy

Tension is necessary.

The player should:
- fear mistakes
- prepare carefully
- adapt strategically

But:
- never feel trapped
- never feel hopeless
- never feel punished unfairly

Mode-specific pressure (panic timers, pursuit distance, corruption hallucinations) must remain fair and purposeful.

---

# Replayability Philosophy

Replayability comes from:
- distinct game modes (`gameModeRegistry`)
- adaptive systems
- hidden events
- scaling dungeons + roguelike modifiers
- relationship systems
- evolving mastery
- live sector events

Not from repetitive grinding or reskinned exercises.

---

# Gameplay Priorities

Priority order:
1. gameplay clarity
2. immersion
3. mechanical differentiation
4. progression
5. tension
6. visual polish

---

# System Integration

Every major system must reinforce the core loop via `GameModeId` routing:

- Training → discipline drills (signal, kanji, memory, shadow echo)
- Quests → environmental curiosity (terminal breach, ghost interrogation, lost transmission)
- Dungeons → survival pressure (corruption run, void pursuit, roguelike)
- Contracts → social tension (deep cover, panic channel)
- Vocabulary → discovery (entity hunt, semantic network)

Any feature that does not strengthen the loop or blur into another mode's identity is feature creep.

---

# Long-Term Player Experience

The player journey should evolve from:
- confusion
→ understanding
→ competence
→ mastery
→ obsession

The player should eventually feel:
"I became stronger because I actually improved."

Not:
"The app gave me dopamine stickers."

---

# Reference

North star: [`GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md`](GAMEPLAY-EVOLUTION-AND-SYSTEM-DIFFERENTIATION-MASTER-DOCUMENT.md)
