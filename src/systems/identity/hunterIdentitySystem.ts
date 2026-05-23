import type { HunterIdentityContract } from "@/contracts/player-contract"
import { HUNTER_CODENAMES } from "@/config/hunterCodenames"

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

export function deriveRegistryId(userId: string): string {
  const n = hashSeed(userId) % 10000
  return `HN-${String(n).padStart(4, "0")}`
}

export function deriveCodename(userId: string): string {
  const idx = hashSeed(`${userId}:codename`) % HUNTER_CODENAMES.length
  return HUNTER_CODENAMES[idx]!
}

export function resolveHunterIdentity(
  userId: string,
  stored?: Partial<HunterIdentityContract> | null
): HunterIdentityContract {
  const registryId = stored?.registryId?.trim() || deriveRegistryId(userId)
  const codename = stored?.codename?.trim() || deriveCodename(userId)
  return { registryId, codename }
}

export function identityNeedsPersist(
  userId: string,
  stored?: Partial<HunterIdentityContract> | null
): boolean {
  if (!stored?.registryId || !stored?.codename) return true
  return (
    stored.registryId !== deriveRegistryId(userId) &&
    !stored.registryId.startsWith("HN-")
  )
}
