import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { resolveMasterForRun } from "@/systems/dungeons/dungeonMasterSystem"
import { masterAwarenessTier } from "@/systems/dungeons/dungeonMasterSystem"

export function domainBackdropClasses(run: DungeonRunContract): string {
  const master = resolveMasterForRun(run)
  const tier = masterAwarenessTier(run.threat?.bossAwareness ?? 0)
  const parts = [
    "nozomi-dungeon-domain-backdrop",
    master.visualProfile.cssClass,
    master.visualProfile.motionClass,
    `nozomi-dungeon-domain--tier-${tier}`,
  ]
  if (run.machineState === "BOSS") parts.push("nozomi-dungeon-domain--boss")
  return parts.join(" ")
}

export function corruptionDistortionClass(run: DungeonRunContract): string {
  const c = run.threat?.corruptionPressure ?? 0
  if (c >= 75) return "nozomi-corruption-distort--severe"
  if (c >= 50) return "nozomi-corruption-distort--medium"
  if (c >= 25) return "nozomi-corruption-distort--light"
  return ""
}
