# Economy Flow

## Stamina

1. Player enters dungeon from detail → `spend_stamina_guarded` (migration 006)
2. Client updates `player.economy.stamina` via `staminaSystem`

## Inventory

1. `complete_quest_guarded` grants `rewards.items` via `grant_inventory_items`
2. `loadPlayerInventory` on hydrate / after completion
3. `/inventory` displays grid + capacity
4. **Sell** (`?mode=sell`) — tap item → `sell_item_guarded` returns 50% of catalog `credit_price` per unit; equipped items must be unequipped first

## Brew

1. `/vocabulary` → Brew → `brew_word_guarded(wordId)` deducts brew tokens
2. Inserts/updates `word_mastery` only (never `vocabulary_entries` writes)

## Rewards claim

1. Quest/dungeon completion sets `progression.pending_rewards`
2. `RewardClaimOverlay` → `clear_pending_rewards_guarded` → local clear + rehydrate (RPC failure keeps overlay open)

## Shop (`/inventory` → Shop tab)

1. Black market rotation — `shopRotationSystem` picks daily featured items per player + UTC date; server validates via `is_shop_item_available` / `effective_shop_price` (migration `011`)
2. Listings grouped by `shop_category` (combat boosts, quest manipulation, dungeon utility, cosmetics, standard)
3. `purchase_item_guarded(itemKey, quantity)` deducts credits at rotation-adjusted price and grants inventory
4. Rehydrate player after purchase; emits `SHOP_PURCHASED` + `ITEM_GRANTED`

## XP → Credits conversion

1. Hunter Core Exchange panel in shop tab
2. Tiered inefficient rates with 30% tax (`xpConversionSystem`)
3. `convert_xp_to_credits_guarded(p_xp_amount)` — max 3 conversions per UTC day
4. Lore warning: “Converting XP destabilizes your Hunter Core.”

## Consumable effect hooks (migration 012–013)

| Effect | Trigger | System |
|--------|---------|--------|
| System Breach | Quest/dungeon completion | Server `nozomi_apply_completion_rewards` + consume |
| Reward Amplifier | Completion | Server completion path + consume |
| XP Booster | Completion | Server completion path (timed, not consumed) |
| Rank Shield | Quest/dungeon failure | suppress xpDebt + consume |
| Quest Retry | Shop → Active Enhancements | `shopEffectActions.retryMostRecentFailedContract` |
| Skip Token | Hunt view | `shopEffectActions.skipQuestObjective` |
| Revive Token | Dungeon encounter failure | extra life in `handleDungeonFailure` |
| Escape Beacon | Dungeon abort | penalty-free extract in `abandonDungeon` |
| Time Freeze | Sector run | `shopEffectActions.freezeDungeonTimer` + countdown UI |
| Title Unlock | Consumable use | SQL grants `title:the-unbroken` |
| Cosmetic Aura | Consumable use | `hunterPresentationSystem.shopAuraClass` |

## Completion (server-owned)

1. Client calls `completeQuestGuarded(questId, 0)` — no client XP math
2. RPC loads `active_boosts` + fatigue, computes grants, consumes use-based boosts
3. `completionService.syncRewardStateFromServer` rehydrates credits, inventory, `active_boosts`


1. Activatable items: `shopItemEffects.ts` (client preview) + `item_catalog` effect columns (server source of truth)
2. `use_consumable_guarded(itemKey)` deducts stack, writes `progression.active_boosts` (title unlock grants `titles` entry)
3. `boostSystem` applies encounter-time effects (mistake shield, stat buffer, revive, etc.)
4. Completion rewards computed server-side; `previewCompletionRewards` is UI-only

## Equip (Loadout tab)

1. Tap equipment → `setItemEquipped` via `inventoryActions.toggleItemEquipped`
2. Only one equipment piece equipped at a time
3. Feeds `hunterPowerSystem` and preparation checklist

## Stamina refund

1. Dungeon enter records `dungeonRun.staminaSpent`
2. Abort → `refund_stamina_guarded` + `STAMINA_REFUNDED` event

## Daily regen

1. On `loadPlayer` → `apply_daily_stamina_guarded` (server, once per UTC day)
