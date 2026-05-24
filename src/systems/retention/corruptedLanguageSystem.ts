/** False-language anomalies — real vs corrupted token detection. */

const CORRUPTED_SUFFIXES = ["ゥ", "ヵ", "ゔ", "ゖ"] as const

const CORRUPTED_ROMANJI_PATTERNS = [
  /^[aeiou]{4,}$/i,
  /xx$/,
  /qq$/,
] as const

export interface CorruptedTokenCheck {
  token: string
  isCorrupted: boolean
  reason?: string
}

export function isCorruptedJapanese(token: string): CorruptedTokenCheck {
  const trimmed = token.trim()
  if (!trimmed) {
    return { token: trimmed, isCorrupted: false }
  }

  for (const suffix of CORRUPTED_SUFFIXES) {
    if (trimmed.endsWith(suffix)) {
      return {
        token: trimmed,
        isCorrupted: true,
        reason: "Mutated kana terminus",
      }
    }
  }

  if (/[\u30a0-\u30ff]{1,2}[\u4e00-\u9fff]{1}[\u30a0-\u30ff]{1,2}/.test(trimmed)) {
    return {
      token: trimmed,
      isCorrupted: true,
      reason: "Fragmented glyph assembly",
    }
  }

  return { token: trimmed, isCorrupted: false }
}

export function isCorruptedRomaji(romaji: string): boolean {
  const r = romaji.trim()
  return CORRUPTED_ROMANJI_PATTERNS.some((p) => p.test(r))
}

export function corruptDisplayToken(authentic: string, seed: number): string {
  if (!authentic.length) return authentic
  const suffix = CORRUPTED_SUFFIXES[seed % CORRUPTED_SUFFIXES.length]!
  return `${authentic}${suffix}`
}

export function validateLearnerToken(
  shown: string,
  expected: string
): { valid: boolean; corrupted: boolean } {
  const check = isCorruptedJapanese(shown)
  if (check.isCorrupted) {
    return { valid: false, corrupted: true }
  }
  return {
    valid: shown.trim() === expected.trim(),
    corrupted: false,
  }
}
