import { createClient } from "@/lib/supabase/client"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

export async function spendStaminaGuarded(
  amount: number,
  dungeonKey: string
): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("spend_stamina_guarded", {
    p_amount: amount,
    p_dungeon_key: dungeonKey,
  })
  if (error) throw new Error(error.message)
}

export async function refundStaminaGuarded(amount: number): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("refund_stamina_guarded", {
    p_amount: amount,
  })
  if (error) throw new Error(error.message)
}

export async function brewWordGuarded(wordId: string): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("brew_word_guarded", {
    p_word_id: wordId,
  })
  if (error) throw new Error(error.message)
}

export async function clearPendingRewardsGuarded(): Promise<unknown> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("clear_pending_rewards_guarded")
  if (error) throw new Error(error.message)
  return data
}

export async function applyDailyStaminaGuarded(): Promise<{
  regenned: boolean
  stamina: number
}> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("apply_daily_stamina_guarded")
  if (error) throw new Error(error.message)
  const row = data as { regenned?: boolean; stamina?: number }
  return {
    regenned: Boolean(row?.regenned),
    stamina: Number(row?.stamina ?? 0),
  }
}

export interface PurchaseItemResult {
  credits: number
  itemKey: string
  quantity: number
  spent: number
}

export async function purchaseItemGuarded(
  itemKey: string,
  quantity: number
): Promise<PurchaseItemResult> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("purchase_item_guarded", {
    p_item_key: itemKey,
    p_quantity: quantity,
  })
  if (error) throw new Error(error.message)
  const row = data as Record<string, unknown>
  return {
    credits: Number(row.credits ?? 0),
    itemKey: String(row.item_key ?? itemKey),
    quantity: Number(row.quantity ?? quantity),
    spent: Number(row.spent ?? 0),
  }
}

export async function updateTrackedQuestRow(
  userId: string,
  userQuestRowId: string | null
): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase
    .from("profiles")
    .update({ tracked_quest_id: userQuestRowId })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}
