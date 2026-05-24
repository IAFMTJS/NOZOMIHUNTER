import { createClient } from "@/lib/supabase/client"
import type { InventorySlotContract } from "@/contracts/economy-contract"

function requireClient() {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured")
  return supabase
}

export async function persistInventorySlots(
  userId: string,
  slots: InventorySlotContract[]
): Promise<void> {
  const supabase = requireClient()
  for (const slot of slots) {
    await supabase.from("player_inventory").upsert(
      {
        user_id: userId,
        item_key: slot.itemKey,
        quantity: slot.quantity,
        equipped: slot.equipped ?? false,
      },
      { onConflict: "user_id,item_key" }
    )
  }
}
