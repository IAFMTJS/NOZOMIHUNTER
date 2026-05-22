# failure-design.md

# NOZOMI Failure Design

# Core Philosophy

Failure is not punishment.

Failure is:
- tension
- atmosphere
- immersion
- progression pressure

Failure must make the world feel dangerous without making the player feel helpless.

---

# What Failure Should Feel Like

Failure should feel:
- uncomfortable
- meaningful
- recoverable
- motivating

Failure should NEVER feel:
- random
- unfair
- exhausting
- hopeless

---

# Penalty Philosophy

Penalties exist to:
- create stakes
- reinforce preparation
- reward consistency
- increase immersion

Penalties are part of the atmosphere.

---

# Allowed Penalty Types

## Corruption
Represents mental/system instability.

Effects:
- distorted UI effects
- increased dungeon difficulty
- unstable encounters

Implemented (v0.7.1, `penaltyGameplaySystem`):
- Fewer wrong attempts before encounter fail: `5 - floor(corruption / 15)`, minimum 3
- Listening replay cap per fragment: `3 - floor(corruption / 10)`, minimum 1
- Dungeon sector failure budget: 1 failure when corruption ≥ 40 (else 2)
- UI copy: “Signal degraded” when corruption or fatigue crosses presentation thresholds

---

## Fatigue
Represents exhaustion.

Effects:
- reduced rewards
- slower recovery
- increased hesitation penalties

Implemented (v0.7.1):
- XP multiplier on quest/dungeon rewards (`fatigueXpMultiplier`)
- −1 fatigue on quest or dungeon completion (floor 0)

---

## XP Debt
Represents failed progression.

Effects:
- reduced XP gains until repaid

XP debt must NEVER:
- completely stop progression
- destroy motivation

---

# Recovery Philosophy

Recovery is critical.

Players must always have:
- comeback opportunities
- recovery mechanics
- safe progression paths

A player should never feel permanently punished.

---

# Difficulty Philosophy

Difficulty should:
- increase tension
- encourage preparation
- reward mastery

Difficulty should NOT:
- artificially waste time
- create frustration walls
- require repetitive grinding

---

# Failure Feedback

Feedback should:
- remain immersive
- remain atmospheric
- avoid excessive punishment screens

Avoid:
- loud failure popups
- humiliating messages
- mobile-game punishment loops

---

# Dungeon Failure Philosophy

Dungeon failure should:
- create fear
- create excitement
- create memorable moments

Not:
- create annoyance
- waste massive amounts of time

Partial recovery systems should exist.

---

# AI Failure Philosophy

AI systems should:
- recognize frustration
- adapt intelligently
- avoid emotional manipulation

The AI should feel:
- reactive
- contextual
- intelligent

Never:
- condescending
- robotic
- manipulative

---

# Final Principle

Failure exists to reinforce:
- immersion
- mastery
- emotional weight

Without failure:
progression becomes meaningless.

Without recovery:
failure becomes toxic.