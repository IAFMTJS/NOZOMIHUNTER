import type {
  ItemCatalogEntryContract,
  ShopListingContract,
} from "@/contracts/economy-contract"
import { SHOP_CONFIG } from "@/config/shopConfig"
import { hashSeed } from "@/systems/economy/shopRotationHash"

export function dailyShopSeed(playerId: string, date: string): string {
  return `${playerId}:${date}`
}

export function rotationEligibleKeys(
  catalog: ItemCatalogEntryContract[]
): string[] {
  return catalog
    .filter(
      (e) =>
        e.rotationEligible !== false &&
        e.creditPrice != null &&
        e.creditPrice > 0
    )
    .map((e) => e.key)
    .sort()
}

export function selectDailyRotationKeys(
  eligibleKeys: string[],
  seed: string,
  slotCount: number = SHOP_CONFIG.ROTATION_SLOT_COUNT
): string[] {
  if (eligibleKeys.length === 0) return []
  const selected: string[] = []
  let attempt = 0
  while (selected.length < slotCount && attempt < eligibleKeys.length * 4) {
    const idx = hashSeed(`${seed}:rot:${attempt}`) % eligibleKeys.length
    const key = eligibleKeys[idx]!
    if (!selected.includes(key)) selected.push(key)
    attempt++
  }
  return selected
}

export function featuredDiscountPct(itemKey: string, seed: string): number {
  const h = hashSeed(`${seed}:disc:${itemKey}`)
  return (h % SHOP_CONFIG.MAX_ROTATION_DISCOUNT_PCT) + 1
}

export function isRotationAvailable(
  item: ItemCatalogEntryContract,
  rotationKeys: string[]
): boolean {
  if (item.rotationEligible === false) return true
  return rotationKeys.includes(item.key)
}

export function effectiveUnitPrice(
  basePrice: number,
  featured: boolean,
  discountPct: number
): number {
  if (!featured || discountPct <= 0) return basePrice
  return Math.max(1, Math.floor(basePrice * (1 - discountPct / 100)))
}

export interface ShopRotationContext {
  seed: string
  rotationKeys: string[]
  date: string
}

export function buildShopRotationContext(
  playerId: string,
  catalog: ItemCatalogEntryContract[],
  date = new Date().toISOString().slice(0, 10)
): ShopRotationContext {
  const seed = dailyShopSeed(playerId, date)
  const eligible = rotationEligibleKeys(catalog)
  const rotationKeys = selectDailyRotationKeys(eligible, seed)
  return { seed, rotationKeys, date }
}

export function enrichListingWithRotation(
  item: ItemCatalogEntryContract,
  ctx: ShopRotationContext
): ShopListingContract | null {
  if (item.creditPrice == null || item.creditPrice <= 0) return null

  const rotationAvailable = isRotationAvailable(item, ctx.rotationKeys)
  if (!rotationAvailable) return null

  const featured =
    item.rotationEligible !== false &&
    ctx.rotationKeys.includes(item.key)
  const discountPct = featured
    ? featuredDiscountPct(item.key, ctx.seed)
    : 0
  const creditPrice = effectiveUnitPrice(
    item.creditPrice,
    featured,
    discountPct
  )

  return {
    ...item,
    creditPrice,
    featured,
    discountPct,
    rotationAvailable,
  }
}
