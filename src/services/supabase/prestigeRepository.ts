import { createClient } from "@/lib/supabase/client"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  applyPrestigeResetLocal,
  checkPrestigeEligibility,
} from "@/systems/progression/prestigeSystem"

export async function applyPrestigeReset(
  player: PlayerContract
): Promise<PlayerContract> {
  const eligibility = checkPrestigeEligibility(player)
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason)
  }

  const supabase = createClient()
  if (supabase) {
    const { error } = await supabase.rpc("apply_prestige_reset")
    if (error) throw new Error(error.message)
  }

  return applyPrestigeResetLocal(player)
}
