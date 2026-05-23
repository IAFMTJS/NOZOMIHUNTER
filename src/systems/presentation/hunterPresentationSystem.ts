import type { HunterRank, PlayerContract } from "@/contracts/player-contract"
import type { PenaltyPresentation } from "@/systems/presentation/penaltyPresentationSystem"
import { getPenaltyPresentation } from "@/systems/presentation/penaltyPresentationSystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"

export interface HunterPresentation extends PenaltyPresentation {
  portraitClass: string
  identityAuraClass: string
  readinessClass: string
}

const RANK_AURA: Record<HunterRank, string> = {
  E: "",
  D: "nozomi-rank-d",
  C: "nozomi-rank-c",
  B: "nozomi-rank-b",
  A: "nozomi-rank-a",
  S: "nozomi-rank-s",
}

export function getHunterPresentation(player: PlayerContract): HunterPresentation {
  const penalty = getPenaltyPresentation(player.penalties)
  const readiness = computeReadiness({ player })

  const portrait: string[] = ["nozomi-hunter-portrait"]
  const aura: string[] = [RANK_AURA[player.rank]].filter(Boolean)

  if (player.penalties.corruption >= 50) {
    portrait.push("nozomi-portrait-corrupt")
  } else if (player.penalties.corruption >= 25) {
    portrait.push("nozomi-portrait-corrupt-low")
  }

  if (player.synchronization.status === "AT_RISK") {
    aura.push("nozomi-sync-at-risk")
  }

  const readinessClass =
    readiness.survivalBand === "CRITICAL"
      ? "nozomi-readiness-critical"
      : readiness.survivalBand === "UNSTABLE"
        ? "nozomi-readiness-unstable"
        : ""

  const rankClass = `nozomi-rank-${player.rank.toLowerCase()}`

  return {
    ...penalty,
    shellClass: [penalty.shellClass, rankClass, readinessClass]
      .filter(Boolean)
      .join(" "),
    portraitClass: portrait.join(" "),
    identityAuraClass: aura.join(" "),
    readinessClass,
  }
}
