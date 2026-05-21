# System Rules

Each system has a single responsibility. Systems must not import React.

## progressionSystem

- MAY: calculate XP, levels, ranks, unlocks
- MAY NOT: call Supabase, render UI

## questSystem

- MAY: generate, validate, complete quests
- MAY NOT: calculate XP directly (delegates to progression)

## saveSystem

- MAY: persist player state via services
- MAY NOT: contain reward formulas

## eventBus

- MAY: emit/on events
- MAY NOT: contain business logic

## Services

- MAY: external I/O only (Supabase, OpenAI, Whisper)
- MAY NOT: gameplay calculations

## Components

- MAY: render, trigger actions via hooks
- MAY NOT: XP, penalties, DB queries
