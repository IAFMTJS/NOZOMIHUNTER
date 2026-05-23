# NOZOMI — Visual Direction v2
Version: v2.0
Status: Active Direction
Last Updated: 2026-05-23

---

# Purpose

This document redefines the visual direction of NOZOMI.

The previous direction leaned too far toward:
- dashboard UI
- clean productivity aesthetics
- visible application structure
- “gamified learning app” presentation

The new direction shifts NOZOMI toward:
- atmospheric hunter terminal
- psychological immersion
- tactical sci-fi interface
- cinematic dungeon preparation
- Solo Leveling inspired system tension

NOZOMI must feel like:
> a dangerous system observing the player

NOT:
> a productivity app trying to motivate users.

---

# Core Emotional Identity

The interface should create:
- tension
- isolation
- mystery
- progression hunger
- controlled pressure
- preparation anxiety
- reward anticipation

The player should feel:
- monitored
- ranked
- evaluated
- vulnerable
- stronger over time

The system is not friendly.
It acknowledges progress with restraint.

---

# Visual Philosophy

## Primary Direction

The UI should feel:
- atmospheric
- layered
- cinematic
- vertical
- immersive
- tactical
- minimal
- dangerous
- mysterious

The UI should NOT feel:
- corporate
- productivity-focused
- SaaS-like
- arcade-heavy
- reward-spam driven
- overly colorful
- symmetrical
- overloaded

---

# Interface Identity

NOZOMI is NOT:
- Duolingo
- a habit tracker
- a dashboard
- an admin panel
- a mobile productivity app

NOZOMI IS:
- a hunter system
- a command terminal
- a mission preparation interface
- a dungeon navigation layer
- a psychological progression system

---

# Structural Layout Changes

## Old Direction Problems

The previous UI direction suffered from:
- excessive visible card structures
- obvious layout grids
- dashboard energy
- too much equal spacing
- weak atmosphere density
- “widget stacking”
- overly clean panel separation

This reduced immersion.

---

# New Layout Philosophy

## 1. Vertical Layering

The interface should primarily use:
- vertical stacked sections
- deep scroll progression
- isolated interaction blocks
- cinematic spacing

Avoid:
- multi-column dashboard layouts
- analytics grids
- equal-width cards

Target distribution:

- 80% vertical sections
- 10% overlays
- 10% HUD elements

---

## 2. Single Mental State Per Screen

Each screen should focus on ONE primary psychological purpose.

Examples:

| Screen | Purpose |
|---|---|
| Dashboard | hunter identity & status |
| Mission Prep | readiness & vocabulary briefing |
| Dungeon | tension & navigation |
| Listening Encounter | focus & pressure |
| Extraction | relief & reward |

Never overload screens with unrelated systems.

---

## 3. Reduced Interface Noise

Remove:
- unnecessary dividers
- bright outlines
- visible container borders
- excessive icons
- oversized buttons
- decorative clutter

The UI should emerge from darkness.

---

# Surface & Depth Philosophy

## Darkness First

Darkness is not empty space.
Darkness is atmosphere.

Panels should feel:
- embedded into shadow
- partially hidden
- softly illuminated
- volumetric

Avoid:
- flat black surfaces
- hard card edges
- obvious rectangles

---

# Glow Usage

Glow should be:
- restrained
- soft
- atmospheric
- directional

Glow should NEVER:
- dominate the interface
- replace hierarchy
- create RGB/gamer aesthetics

Purple is environmental light.
Not the main readable color.

---

# Color System Revision

## Primary Palette

```txt
Background: #05070b
Surface: #0b1020
Primary Glow: #7a5cff
Secondary Glow: #9b7dff
Reward Gold: #ffb84d
Danger Red: #ff4d6d
Success Green: #58d68d
Text Primary: #f3f5ff
Text Muted: #78809a
Border Subtle: rgba(255,255,255,0.06)
```

Purple is environmental light. Gold (`--reward`) is for extraction and rank/level acknowledgment only.

---

# Screen Implementation Pass

Each screen owns **one psychological state**. Secondary chrome (install prompt, tutorials, progression banners) appears only on the hunter status menu — not during hunt, dispatch, or dungeon views.

| Screen | Purpose | Implementation |
|--------|---------|----------------|
| Dashboard menu | Hunter identity & status | `ContractHub` menu: identity block, vertical operations; `DashboardClient` gates overlays to `hubView === "menu"` |
| Mission prep | Readiness & briefing | `QuestPreparationGate` + `QuestPreparationBriefing`: vertical vocab stack, `.nozomi-screen-prep`, embedded targets |
| Dungeon | Tension & navigation | `DungeonRunner`: default embedded panel, vertical stepper + corridor rail |
| Listening | Focus & pressure | `ListeningEncounter`: borderless, `.nozomi-signal-well`, error budget in danger color |
| Extraction | Relief & reward | `ExtractionCeremony`: `tone="reward"`, `.nozomi-screen-extraction`, gold XP staging |

## CSS utilities

| Class | Use |
|-------|-----|
| `.nozomi-embedded` / `-accent` | Borderless depth panels |
| `.nozomi-screen-prep` | Preparation atmosphere |
| `.nozomi-screen-extraction` | Extraction gold ambient |
| `.nozomi-signal-well` | Listening waveform well |

## Shell titles

`/dashboard` page title follows hub view: Hunter status → Active hunt → Contract dispatch → Dungeon sector.