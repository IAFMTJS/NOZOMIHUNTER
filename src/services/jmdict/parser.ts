import { FEATURE_FLAGS } from "@/config/features"

export interface JmdictEntry {
  id: string
  japanese: string
  romaji: string
  english: string
  jlpt?: string
  frequency?: number
}

/**
 * JMDict XML parser stub. Run ingest script against full XML in production.
 */
export function parseJmdictXmlStub(xml: string): JmdictEntry[] {
  if (!FEATURE_FLAGS.JMDICT_ENGINE) return []

  if (!xml.trim()) return []

  return [
    {
      id: "1",
      japanese: "狩人",
      romaji: "kariudo",
      english: "hunter",
      jlpt: "N2",
      frequency: 1,
    },
  ]
}
