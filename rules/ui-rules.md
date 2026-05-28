# UI Rules

## Core Philosophy

The UI must feel:
- immersive
- atmospheric
- responsive
- readable
- game-like

Avoid feeling like:
- productivity software
- corporate dashboard
- mobile casino app

---

# UI Priorities

Priority order:
1. readability
2. responsiveness
3. immersion
4. effects
5. decoration

---

# Visual Philosophy

The UI should:
- feel minimal
- feel intentional
- feel layered
- feel mysterious

Avoid:
- visual clutter
- oversized elements
- dopamine spam (toasts, HUD ticks, stacked minor popups)
- excessive popups

Ceremony exception: tiered full-screen ceremonies (level-up, dungeon clear, achievement unlock) are intentional interrupts — not "spam." They must use `CeremonyOverlay` / ceremony components, not duplicate inset `Panel` wins.

---

# HUD Rules

HUD elements must:
- communicate clearly
- avoid screen pollution
- support gameplay focus

HUD should never dominate gameplay.

---

# Animation Rules

Animations must:
- support feedback
- support atmosphere
- support immersion

Avoid:
- random movement
- excessive bouncing
- attention-seeking motion

Motion should feel subtle and deliberate.

---

# Transition Rules

Page transitions:
- smooth
- fast
- immersive

Avoid:
- flashy transitions
- unnecessary delays

---

# Typography Rules

Typography must:
- remain highly readable
- maintain hierarchy
- avoid decorative overload

Readable > stylish.

---

# Color Philosophy

Colors should communicate:
- status
- danger
- corruption
- progression
- rarity

Avoid:
- rainbow UI
- over-saturation
- visual chaos

---

# Theme & Color Modes

NOZOMI uses **dark** and **light** theme tokens. See `rules/theme-rules.md` for the full contract.

**Mandatory:** Any new button, page, panel, shadow, gradient, or colored UI must:
1. Use semantic CSS variables (`var(--accent)`, etc.) — never raw hex/rgba in components.
2. Define the same variable in **both** `src/styles/themes/dark.css` and `src/styles/themes/light.css`.

Default runtime theme: `data-theme="dark"` on `<html>`.

---

# Modal Rules

Modals must:
- interrupt minimally
- feel important
- avoid stacking

Never spam modals.

---

# Audio Feedback Philosophy

UI audio should:
- reinforce actions
- support immersion
- remain subtle

Avoid:
- loud repetitive sounds
- casino feedback loops

---

# Mobile Philosophy

The experience must feel:
- premium
- responsive
- game-first

Not:
- like a bloated mobile app

---

# Penalty Presentation

Penalties should feel:
- uncomfortable
- immersive
- atmospheric

Not:
- annoying
- unfair
- frustrating

---

# Progression Feedback

Level ups and rewards should:
- feel meaningful
- feel earned
- feel impactful

Avoid excessive reward spam.

---

# Final Rule

Every UI element must answer:
"What gameplay purpose does this serve?"

If none:
remove it.