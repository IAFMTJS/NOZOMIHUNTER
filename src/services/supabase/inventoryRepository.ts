import { createClient } from "@/lib/supabase/client"
import type { InventorySlotContract, ItemCatalogEntryContract } from "@/contracts/economy-contract"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

export async function loadPlayerInventory(
  userId: string
): Promise<InventorySlotContract[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("player_inventory")
    .select("item_key, quantity, equipped")
    .eq("user_id", userId)

  if (error || !data) return []

  return data.map((row) => ({
    itemKey: row.item_key,
    quantity: row.quantity,
    equipped: row.equipped ?? false,
  }))
}

export async function loadItemCatalog(): Promise<ItemCatalogEntryContract[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("item_catalog")
    .select("key, name, category, icon, stackable, credit_price")

  if (error || !data) return []
  return data.map((row) => ({
    key: row.key,
    name: row.name,
    category: row.category as ItemCatalogEntryContract["category"],
    icon: row.icon,
    stackable: row.stackable,
    creditPrice: row.credit_price ?? null,
  }))
}

export async function setItemEquipped(
  userId: string,
  itemKey: string,
  equipped: boolean
): Promise<void> {
  const supabase = requireClient()
  await supabase
    .from("player_inventory")
    .update({ equipped })
    .eq("user_id", userId)
    .eq("item_key", itemKey)
}
