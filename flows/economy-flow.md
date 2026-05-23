# Economy Flow

## Stamina

1. Player enters dungeon from detail → `spend_stamina_guarded` (migration 006)
2. Client updates `player.economy.stamina` via `staminaSystem`

## Inventory

1. `complete_quest_guarded` grants `rewards.items` via `grant_inventory_items`
2. `loadPlayerInventory` on hydrate / after completion
3. `/inventory` displays grid + capacity

## Brew

1. `/vocabulary` → Brew → `brew_word_guarded(wordId)` deducts brew tokens
2. Inserts/updates `word_mastery` only (never `vocabulary_entries` writes)

## Rewards claim

1. Quest/dungeon completion sets `progression.pending_rewards`
2. `RewardClaimOverlay` → `clear_pending_rewards_guarded` → local clear + rehydrate (RPC failure keeps overlay open)

## Shop (`/inventory` → Shop tab)

1. Listings from `item_catalog` where `credit_price` is set
2. `purchase_item_guarded(itemKey, quantity)` deducts credits and grants inventory
3. Rehydrate player after purchase

## Equip (Loadout tab)

1. Tap equipment → `setItemEquipped` via `inventoryActions.toggleItemEquipped`
2. Only one equipment piece equipped at a time
3. Feeds `hunterPowerSystem` and preparation checklist

## Stamina refund

1. Dungeon enter records `dungeonRun.staminaSpent`
2. Abort → `refund_stamina_guarded` + `STAMINA_REFUNDED` event

## Daily regen

1. On `loadPlayer` → `apply_daily_stamina_guarded` (server, once per UTC day)
