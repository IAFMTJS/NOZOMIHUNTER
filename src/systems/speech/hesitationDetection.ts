const HESITATION_PATTERNS = [
  /\.{2,}/,
  /\b(um|uh|er|ah)\b/i,
  /えっと/,
  /あの/,
  /えーと/,
  /まあ/,
  /その/,
] as const

export function detectHesitationMarkers(transcript: string): string[] {
  const hits: string[] = []
  for (const pattern of HESITATION_PATTERNS) {
    const matches = transcript.match(new RegExp(pattern.source, "gi"))
    if (matches) hits.push(...matches)
  }
  return hits
}

/** Higher = more hesitation (0–100). */
export function scoreHesitation(transcript: string): number {
  const markers = detectHesitationMarkers(transcript)
  const fillerDensity =
    transcript.length > 0 ? (markers.length / transcript.length) * 120 : 0
  return Math.min(100, markers.length * 12 + fillerDensity)
}
