import type {
  SemanticNetworkLinkContract,
  SemanticNetworkNodeContract,
} from "@/contracts/encounter-contract"
import { sampleCatalogEntries } from "@/systems/mastery/vocabularyCatalog"

export function createSemanticNetworkEncounter(): {
  nodes: SemanticNetworkNodeContract[]
  links: SemanticNetworkLinkContract[]
  matchedLinkIds: string[]
} {
  const entries = sampleCatalogEntries(4)
  const nodes: SemanticNetworkNodeContract[] = [
    ...entries.map((e, i) => ({
      id: `meaning-${i}`,
      label: e.meanings[0] ?? "unknown",
      group: "meaning" as const,
    })),
    ...entries.map((e, i) => ({
      id: `kanji-${i}`,
      label: e.japanese.join("") || "—",
      japanese: e.japanese.join(""),
      reading: e.reading.join(""),
      group: "kanji" as const,
    })),
    ...entries.map((e, i) => ({
      id: `ctx-${i}`,
      label: `Sector log ${i + 1}`,
      group: "context" as const,
    })),
  ]
  const links: SemanticNetworkLinkContract[] = entries.map((_, i) => ({
    fromId: `meaning-${i}`,
    toId: `kanji-${i}`,
  }))
  return { nodes, links, matchedLinkIds: [] }
}

export function toggleSemanticLink(
  matched: string[],
  linkId: string,
  fromId: string,
  toId: string
): string[] {
  const id = `${fromId}:${toId}`
  if (matched.includes(id)) return matched.filter((m) => m !== id)
  return [...matched, id]
}

export function semanticNetworkComplete(
  links: SemanticNetworkLinkContract[],
  matched: string[]
): boolean {
  return links.every((l) => matched.includes(`${l.fromId}:${l.toId}`))
}
