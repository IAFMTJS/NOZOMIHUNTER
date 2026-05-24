import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"

export function dungeonFailureConsequenceLines(
  penalties: PlayerPenaltyContract
): string[] {
  const p = DUNGEON_CONFIG.DUNGEON_FAILURE_PENALTIES
  return [
    `XP debt +${p.xpDebt}`,
    `Corruption +${p.corruption} (now ${penalties.corruption})`,
    `Fatigue +${p.fatigue}`,
    "Sector streak broken — extraction failed",
  ]
}

export function dungeonFailureHeadline(): string {
  return "SECTOR BREACH — EXTRACTION DENIED"
}
