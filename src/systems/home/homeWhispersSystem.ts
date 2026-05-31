import { HOME_WHISPERS } from "@/config/homeWhispers"
import type { IrisTrustTier } from "@/contracts/narrative-contract"

const WHISPER_TIERS: IrisTrustTier[] = ["COOPERATIVE", "TRUSTED", "CONFIDANT"]

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

export function homeWhisperEligible(trustTier: IrisTrustTier): boolean {
  return WHISPER_TIERS.includes(trustTier)
}

export function pickHomeWhisper(seed: string): string {
  const idx = hashSeed(seed) % HOME_WHISPERS.length
  return HOME_WHISPERS[idx] ?? HOME_WHISPERS[0]
}
