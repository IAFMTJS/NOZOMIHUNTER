import type { HunterRank, PlayerContract } from "@/contracts/player-contract"
import type { PenaltyPresentation } from "@/systems/presentation/penaltyPresentationSystem"
import { getPenaltyPresentation } from "@/systems/presentation/penaltyPresentationSystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { minDungeonLevel } from "@/systems/dungeons/dungeonAccess"
import { activeBoostsForPlayer } from "@/systems/economy/boostSystem"
import { getItemEffect } from "@/config/shopItemEffects"

export interface HunterPresentation extends PenaltyPresentation {
  portraitClass: string
  identityAuraClass: string
  shopAuraClass: string
  readinessClass: string
  headerClass: string
  huntCtaClass: string
}

const RANK_AURA: Record<HunterRank, string> = {
  E: "",
  D: "nozomi-rank-d",
  C: "nozomi-rank-c",
  B: "nozomi-rank-b",
  A: "nozomi-rank-a",
  S: "nozomi-rank-s",
  SS: "nozomi-rank-ss",
  SSS: "nozomi-rank-sss",
}

const RANK_HEADER: Record<HunterRank, string> = {
  E: "",
  D: "nozomi-header-rank-d",
  C: "nozomi-header-rank-c",
  B: "nozomi-header-rank-b",
  A: "nozomi-header-rank-a",
  S: "nozomi-header-rank-s",
  SS: "nozomi-header-rank-ss",
  SSS: "nozomi-header-rank-sss",
}

export function getMenuDenialCopy(
  operation: "hunt" | "sector",
  player: PlayerContract
): string | null {
  if (player.synchronization.status === "BROKEN") {
    return "Access denied — synchronization broken. Restore discipline chain."
  }
  if (player.synchronization.status === "AT_RISK") {
    return "Access restricted — synchronization unstable."
  }
  const readiness = computeReadiness({ player })
  if (readiness.survivalBand === "CRITICAL") {
    return "Deployment denied — operational readiness critical."
  }
  if (operation === "sector" && player.level < minDungeonLevel()) {
    return "Corridor sealed — hunter level insufficient."
  }
  if (operation === "hunt") {
    return "No active contract — request deployment from dispatch."
  }
  return "Corridor sealed — requirements not met."
}

export function getHunterPresentation(player: PlayerContract): HunterPresentation {
  const penalty = getPenaltyPresentation(player.penalties)
  const readiness = computeReadiness({ player })

  const portrait: string[] = ["nozomi-hunter-portrait"]
  const aura: string[] = [RANK_AURA[player.rank]].filter(Boolean)
  const headerParts: string[] = [RANK_HEADER[player.rank]].filter(Boolean)

  if (player.penalties.corruption >= 50) {
    portrait.push("nozomi-portrait-corrupt")
    headerParts.push("nozomi-header-corrupt")
  } else if (player.penalties.corruption >= 25) {
    portrait.push("nozomi-portrait-corrupt-low")
    headerParts.push("nozomi-header-corrupt-low")
  }

  if (player.synchronization.status === "AT_RISK") {
    aura.push("nozomi-sync-at-risk")
  }

  const shopAura = activeBoostsForPlayer(player).find(
    (b) => b.effectType === "COSMETIC_AURA"
  )
  const shopAuraClass = shopAura
    ? `nozomi-shop-aura-${resolveAuraKey(shopAura)}`
    : ""
  if (shopAuraClass) {
    aura.push(shopAuraClass)
  }

  const readinessClass =
    readiness.survivalBand === "CRITICAL"
      ? "nozomi-readiness-critical"
      : readiness.survivalBand === "UNSTABLE"
        ? "nozomi-readiness-unstable"
        : ""

  const huntCtaClass =
    readiness.survivalBand === "CRITICAL"
      ? "nozomi-deploy-risky"
      : readiness.survivalBand === "UNSTABLE"
        ? "nozomi-deploy-caution"
        : ""

  const rankClass = `nozomi-rank-${player.rank.toLowerCase()}`

  return {
    ...penalty,
    shellClass: [penalty.shellClass, rankClass, readinessClass]
      .filter(Boolean)
      .join(" "),
    portraitClass: portrait.join(" "),
    identityAuraClass: aura.join(" "),
    shopAuraClass,
    readinessClass,
    headerClass: headerParts.filter(Boolean).join(" "),
    huntCtaClass,
  }
}

function resolveAuraKey(boost: { itemKey: string; metadata?: Record<string, number | string> }): string {
  const fromMeta = boost.metadata?.auraKey
  if (typeof fromMeta === "string") return fromMeta
  return getItemEffect(boost.itemKey)?.auraKey ?? "shadow"
}
