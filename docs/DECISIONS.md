# Architecture decisions

## Readiness deploy policy (UX audit, 2026-05)

**Context:** Hunters with high corruption, fatigue, and XP debt can drop into `CRITICAL` readiness (&lt; 35%), which previously blocked all deployments including training — a soft-lock with no recovery path.

**Decision:**

- `CRITICAL` readiness **hard-blocks** story contracts, side/daily missions, and dungeon deployment.
- **Training drills** bypass the critical gate (`allowCritical: true` in prepare/deploy checks). Unstable readiness still prompts confirmation.
- Recovery surfaces: home operational alerts → `/training`, prepare screen recovery links → `/training` and `/vocabulary`.
- Vocabulary preparation score on active contracts refreshes when mastery changes (mark as learned).

**Rationale:** Readiness remains tension for high-stakes content; training and vocabulary are the designed safe practice loop per gameplay evolution docs.

## Dungeon REWARD route selection (UX audit, 2026-05)

**Context:** Choosing a route while `machineState === "REWARD"` attempted `REWARD → ENCOUNTER`, which the state machine rejects.

**Decision:** `chooseDungeonRoute` transitions `REWARD → EXPLORATION` before engaging the target encounter node. State machine transitions are not extended for direct `REWARD → ENCOUNTER`.

## Completed story contract detail (UX audit, 2026-05)

**Decision:** Completed story entries open in **read-only** detail (no deploy CTA). Active/completed snapshots resolve via `resolveQuestRecord` across regular, active, and completed quest lists.

## Guest authentication (UX audit, 2026-05)

**Decision:** Guest sign-in is hidden unless `NEXT_PUBLIC_ENABLE_GUEST_AUTH=true` **and** Supabase anonymous auth is enabled for the project. Default is off to avoid a misleading login affordance.
