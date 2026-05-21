import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { containsKana, kanaToRomaji } from "./kanaRomaji"
import { formatKanaRomajiLabel, normalizeJapanese, normalizeRomaji } from "./normalize"

/** Exact phrases used in conversation scenarios and director replies. */
const PHRASE_READINGS: Record<string, string> = {
  "準備はいいですか？": "junbi wa ii desu ka?",
  "準備はいいですか": "junbi wa ii desu ka?",
  "何が見えますか？": "nani ga miemasu ka?",
  "何が見えますか": "nani ga miemasu ka",
  "簡潔に。": "kanketsu ni.",
  "簡潔に": "kanketsu ni",
  "準備できています": "junbi dekite imasu",
  "ようこそ": "youkoso",
  "いい質問だ": "ii shitsumon da",
  "いい質問だ。": "ii shitsumon da.",
  "落ち着け": "ochitsuke",
  "落ち着け。": "ochitsuke.",
  "またな": "mata na",
  "またな。": "mata na.",
  "日本語でも": "nihongo demo",
  "でも": "demo",
  "日本語": "nihongo",
}

const catalogByJapanese = new Map(
  JMDICT_CURATED.flatMap((e) =>
    e.japanese.map(
      (k) => [normalizeJapanese(k), formatKanaRomajiLabel(e)] as const
    )
  )
)

const JAPANESE_SEGMENT =
  /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+/g

const ALREADY_PAIRED =
  /([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+)\s*\([^)]+\)/g

export function hasJapanese(text: string): boolean {
  JAPANESE_SEGMENT.lastIndex = 0
  return JAPANESE_SEGMENT.test(text)
}

export function extractJapaneseSegments(text: string): string[] {
  const matches = text.match(JAPANESE_SEGMENT) ?? []
  const seen = new Set<string>()
  const out: string[] = []
  for (const m of matches) {
    const n = normalizeJapanese(m)
    if (!seen.has(n)) {
      seen.add(n)
      out.push(m)
    }
  }
  return out
}

function stripPunctuation(segment: string): string {
  return segment.replace(/^[、。．，？！?!\s]+|[、。．，？！?!\s]+$/g, "")
}

function lookupSegmentReading(segment: string): string | undefined {
  const normalized = normalizeJapanese(segment)
  if (PHRASE_READINGS[normalized]) return PHRASE_READINGS[normalized]

  const stripped = stripPunctuation(normalized)
  if (PHRASE_READINGS[stripped]) return PHRASE_READINGS[stripped]

  const catalog = catalogByJapanese.get(normalized)
  if (catalog) return catalog

  if (containsKana(normalized)) {
    const fromKana = kanaToRomaji(normalized)
    if (fromKana) return normalizeRomaji(fromKana)
  }

  return undefined
}

function fallbackSegmentReading(segment: string): string {
  return lookupSegmentReading(segment) ?? "—"
}

/** Romaji reading for Japanese segments in a message. */
export function buildMessageReading(content: string): string | undefined {
  const segments = extractJapaneseSegments(content)
  if (!segments.length) return undefined

  const readings: string[] = []
  for (const segment of segments) {
    const reading = lookupSegmentReading(segment)
    if (reading) readings.push(reading)
  }

  if (!readings.length) return undefined
  return [...new Set(readings)].join(" · ")
}

export function resolveMessageReading(
  content: string,
  explicit?: string
): string | undefined {
  return explicit ?? buildMessageReading(content)
}

/** Learner rule: Japanese must ship with romaji. */
export function requireMessageReading(
  content: string,
  explicit?: string
): string {
  if (!hasJapanese(content)) return explicit ?? ""

  const reading = resolveMessageReading(content, explicit)
  if (reading) return reading

  const segments = extractJapaneseSegments(content)
  const missing = segments.filter((s) => !lookupSegmentReading(s))
  if (missing.length) {
    console.warn(
      "[NOZOMI] Missing romaji for Japanese segment(s):",
      missing.join(", ")
    )
  }
  return reading ?? "—"
}

/** `日本語 (romaji)` — idempotent. */
export function pairJapanese(japanese: string, romaji: string): string {
  const trimmed = japanese.trim()
  if (!trimmed) return romaji
  if (trimmed.includes(`(${romaji})`)) return trimmed
  return `${trimmed} (${romaji})`
}

export function stripRomajiPairs(content: string): string {
  return content.replace(ALREADY_PAIRED, "$1")
}

/**
 * Inline romaji after every Japanese segment. Required before showing/storing learner-facing text.
 */
export function embedRomajiInContent(
  content: string,
  explicitReading?: string
): string {
  if (!hasJapanese(content)) return content

  const bare = stripRomajiPairs(content)
  const readingQueue = explicitReading
    ? explicitReading.split(" · ").map((r) => r.trim())
    : []

  let queueIndex = 0
  let result = ""
  let lastIndex = 0

  for (const match of bare.matchAll(JAPANESE_SEGMENT)) {
    const segment = match[0]
    const index = match.index ?? 0

    if (index > lastIndex) {
      result += bare.slice(lastIndex, index)
    }

    const after = bare.slice(index + segment.length).trimStart()
    if (after.startsWith("(")) {
      result += segment
      lastIndex = index + segment.length
      continue
    }

    const reading =
      lookupSegmentReading(segment) ??
      readingQueue[queueIndex++] ??
      fallbackSegmentReading(segment)

    result += pairJapanese(segment, reading)
    lastIndex = index + segment.length
  }

  result += bare.slice(lastIndex)
  return result
}

/** Format any learner-facing string that may contain Japanese. */
export function formatLearnerContent(
  content: string,
  explicitReading?: string
): string {
  return embedRomajiInContent(content, explicitReading)
}
