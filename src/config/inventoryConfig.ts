/** Master relic item keys (flavor trophies from perfect clears). */
export const MASTER_RELIC_ITEMS = [
  "warden-access-core",
  "forgotten-index",
  "static-omamori",
  "devoured-seal",
  "cracked-hunter-crest",
] as const

export const INVENTORY_CONFIG = {
  CAPACITY: 100,
  STARTER_ITEMS: [
    { itemKey: "recovery-draft", quantity: 2 },
    { itemKey: "shadow-shard", quantity: 1 },
    { itemKey: "hunter-blade", quantity: 1 },
  ],
} as const
