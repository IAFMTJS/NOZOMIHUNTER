export function scoreConfidence(
  transcript: string,
  hesitationScore: number
): number {
  const trimmed = transcript.trim()
  if (!trimmed) return 0

  const lengthFactor = Math.min(40, trimmed.length * 1.5)
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length
  const structureBonus = Math.min(25, wordCount * 8)
  const hesitationPenalty = hesitationScore * 0.65

  return Math.max(
    0,
    Math.round(35 + lengthFactor + structureBonus - hesitationPenalty)
  )
}
