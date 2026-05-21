import { FEATURE_FLAGS } from "@/config/features"
import type { RaidPartyContract } from "@/contracts/multiplayer-contract"

export function createRaidParty(
  dungeonId: string,
  leaderId: string,
  username: string
): RaidPartyContract | null {
  if (!FEATURE_FLAGS.MULTIPLAYER || !FEATURE_FLAGS.RAIDS) {
    return null
  }

  return {
    id: `raid-${Date.now()}`,
    dungeonId,
    status: "FORMING",
    members: [
      {
        playerId: leaderId,
        username,
        role: "SPEAKER",
      },
    ],
  }
}

/**
 * Supabase Realtime sync — implement in Phase 6 when flags enabled.
 */
export function syncRaidState(_party: RaidPartyContract): void {
  void _party
  if (!FEATURE_FLAGS.MULTIPLAYER) return
}
