import type { ConversationEncounterContract } from "@/contracts/encounter-contract"

export const RELATIONSHIP_TRUST_MIN = 0
export const RELATIONSHIP_TRUST_MAX = 100
export const RELATIONSHIP_TRUST_DEFAULT = 50

export interface NpcRelationshipContract {
  userId: string
  npcKey: string
  trust: number
  successfulExchanges: number
  failedExchanges: number
  updatedAt: string
}

export function clampTrust(value: number): number {
  return Math.max(RELATIONSHIP_TRUST_MIN, Math.min(RELATIONSHIP_TRUST_MAX, value))
}

export function adjustRelationshipTrust(
  current: number,
  delta: number
): number {
  return clampTrust(current + delta)
}

export function trustDeltaForExchange(passed: boolean): number {
  return passed ? 6 : -10
}

export function trustBand(trust: number): "HOSTILE" | "WARY" | "NEUTRAL" | "TRUSTED" {
  if (trust < 25) return "HOSTILE"
  if (trust < 45) return "WARY"
  if (trust < 70) return "NEUTRAL"
  return "TRUSTED"
}

export function trustBandLabel(trust: number): string {
  switch (trustBand(trust)) {
    case "HOSTILE":
      return "Cover compromised"
    case "WARY":
      return "Cover unstable"
    case "NEUTRAL":
      return "Cover holding"
    case "TRUSTED":
      return "Deep cover established"
  }
}

export function applyExchangeToEncounterTrust(
  encounter: ConversationEncounterContract,
  passed: boolean
): ConversationEncounterContract {
  const base = encounter.relationshipTrust ?? RELATIONSHIP_TRUST_DEFAULT
  return {
    ...encounter,
    relationshipTrust: adjustRelationshipTrust(base, trustDeltaForExchange(passed)),
  }
}

export function resolveDeepCoverTrust(
  encounter: ConversationEncounterContract | undefined,
  persisted?: NpcRelationshipContract | null
): number {
  if (encounter?.relationshipTrust != null) {
    return encounter.relationshipTrust
  }
  return persisted?.trust ?? RELATIONSHIP_TRUST_DEFAULT
}

export function mergePersistedTrust(
  encounter: ConversationEncounterContract,
  persisted: NpcRelationshipContract | null | undefined
): ConversationEncounterContract {
  if (encounter.relationshipTrust != null) return encounter
  if (!persisted) return encounter
  return { ...encounter, relationshipTrust: persisted.trust }
}

export function toNpcRelationshipRow(
  userId: string,
  npcKey: string,
  encounter: ConversationEncounterContract
): Omit<NpcRelationshipContract, "updatedAt"> & { updatedAt?: string } {
  return {
    userId,
    npcKey,
    trust: encounter.relationshipTrust ?? RELATIONSHIP_TRUST_DEFAULT,
    successfulExchanges: encounter.successfulExchanges,
    failedExchanges: encounter.wrongTurns,
  }
}
