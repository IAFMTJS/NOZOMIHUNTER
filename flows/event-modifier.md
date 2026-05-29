# Flow — live sector event modifiers

1. `eventScheduleConfig` defines weekly sector events with `bonusXpPercent`.
2. `getActiveSectorEvent(seed)` selects active event for home feed seed.
3. `resolveLiveRewardModifiers` → XP multiplier + credit bonus.
4. Quest completion applies modifiers in `questLifecycle` before guarded RPC.
5. Home operational feed shows event title + active XP multiplier.
