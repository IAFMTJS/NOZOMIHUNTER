# Flow: Discipline spend

1. Player earns discipline via `completionService` → `disciplineEarnedForQuest`.
2. Research nodes listed in `disciplineResearchConfig` on inventory relic rail.
3. Spend calls `spendDisciplineAmount` → `spend_discipline_guarded` RPC.
4. `DISCIPLINE_SPENT` analytics event fires.
5. Local player store updates discipline balance.
