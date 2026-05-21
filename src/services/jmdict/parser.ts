import { FEATURE_FLAGS } from "@/config/features"
import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import {
  normalizeJapanese,
  normalizeMeanings,
  priorityTagToTier,
  toVocabularyEntry,
} from "./normalize"

function extractTags(block: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "gi")
  const out: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(block)) !== null) {
    const value = match[1]?.trim()
    if (value) out.push(value)
  }
  return out
}

function extractPriority(block: string, tag: "ke_pri" | "re_pri"): number {
  const tags = extractTags(block, tag)
  if (!tags.length) return priorityTagToTier(undefined)
  return Math.min(...tags.map((t) => priorityTagToTier(t)))
}

function parseEntryBlock(block: string): VocabularyEntryContract | null {
  const seqMatch = block.match(/<ent_seq>(\d+)<\/ent_seq>/i)
  if (!seqMatch) return null

  const entSeq = Number(seqMatch[1])
  const japanese = extractTags(block, "keb").map(normalizeJapanese)
  const reading = extractTags(block, "reb").map(normalizeJapanese)
  const glosses = extractTags(block, "gloss")
  const meanings = normalizeMeanings(glosses)

  if (!reading.length && !japanese.length) return null

  const keTier = extractPriority(block, "ke_pri")
  const reTier = extractPriority(block, "re_pri")
  const frequencyTier = Math.min(keTier, reTier)

  return toVocabularyEntry({
    entSeq,
    japanese,
    reading,
    meanings,
    frequencyTier,
  })
}

/**
 * Parse JMDict XML into normalized vocabulary entries.
 * Used by the ingest script; runtime uses curated catalog + DB cache.
 */
export function parseJmdictXml(xml: string): VocabularyEntryContract[] {
  if (!FEATURE_FLAGS.JMDICT_ENGINE || !xml.trim()) return []

  const entries: VocabularyEntryContract[] = []
  const parts = xml.split(/<entry>/i).slice(1)

  for (const part of parts) {
    const block = part.split(/<\/entry>/i)[0] ?? ""
    const entry = parseEntryBlock(block)
    if (entry) entries.push(entry)
  }

  return entries
}

/** @deprecated Use parseJmdictXml */
export function parseJmdictXmlStub(xml: string): VocabularyEntryContract[] {
  return parseJmdictXml(xml)
}

export type JmdictEntry = VocabularyEntryContract
