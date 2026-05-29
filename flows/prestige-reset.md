# Flow — prestige reset

1. Operator reaches rank **SSS** and level **100**.
2. Profile panel shows prestige eligibility via `checkPrestigeEligibility`.
3. Client calls RPC `apply_prestige_reset` (migration `023_gdd_completion.sql`).
4. `prestige_count` increments; level resets per server rules.
5. Event `PRESTIGE_RESET` logged to `gameplay_events` when wired.
