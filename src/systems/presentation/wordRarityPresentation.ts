import type { WordRarityTier } from "@/components/ui/screen/WordRarityChip"

/** Display-only rarity from stable word id hash. */
export function wordRarityFromId(wordId: string): WordRarityTier {
  let hash = 0
  for (let i = 0; i < wordId.length; i++) {
    hash = (hash + wordId.charCodeAt(i) * (i + 1)) % 997
  }
  const bucket = hash % 10
  if (bucket <= 5) return "COMMON"
  if (bucket <= 8) return "UNCOMMON"
  return "RARE"
}
