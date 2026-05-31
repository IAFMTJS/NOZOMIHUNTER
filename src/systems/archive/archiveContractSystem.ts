import type { PlayerContract } from "@/contracts/player-contract"
import type { ArchiveEntry } from "@/systems/archive/archiveSystem"

export interface ArchiveContractLink {
  contractId: string
  href: string
  label: string
  available: boolean
  reason?: string
}

const LEGACY_ROUTES: Record<
  string,
  { contractId: string; tab: "story" | "side" | "daily"; label: string }
> = {
  "whisper-index": {
    contractId: "tutorial",
    tab: "story",
    label: "Open tutorial recovery",
  },
  "forbidden-kanji": {
    contractId: "story-shadow-archive",
    tab: "story",
    label: "Deploy Shadow Archive contract",
  },
  "forbidden-kanji-chain": {
    contractId: "story-s01-m21",
    tab: "story",
    label: "Deploy Forbidden Index contract",
  },
  "night-report": {
    contractId: "daily:night-scan",
    tab: "daily",
    label: "Request night scan ritual",
  },
}

function storyMissionRoute(contractId: string): ArchiveContractLink {
  return {
    contractId,
    href: `/contracts/${encodeURIComponent(contractId)}?tab=story`,
    label: "Open linked story contract",
    available: true,
  }
}

export function resolveArchiveContractLink(
  entry: ArchiveEntry,
  player: PlayerContract | null
): ArchiveContractLink | null {
  const linked = entry.linkedContractId
  if (linked?.startsWith("story-s01-")) {
    const route = storyMissionRoute(linked)
    if (entry.locked) {
      return { ...route, available: false, reason: entry.lockReason ?? "Entry sealed" }
    }
    return route
  }

  if (linked?.startsWith("side-s01-")) {
    const route = {
      contractId: linked,
      href: `/contracts/${encodeURIComponent(linked)}?tab=side`,
      label: "Open linked side contract",
      available: !entry.locked,
      reason: entry.locked ? entry.lockReason : undefined,
    }
    return route
  }

  const key = linked ?? entry.id
  const route = LEGACY_ROUTES[key] ?? LEGACY_ROUTES[entry.id]
  if (!route) return null

  const href = `/contracts/${encodeURIComponent(route.contractId)}?tab=${route.tab}`
  if (entry.locked) {
    return {
      contractId: route.contractId,
      href,
      label: route.label,
      available: false,
      reason: entry.lockReason ?? "Entry sealed",
    }
  }

  if (key === "forbidden-kanji" || key === "forbidden-kanji-chain") {
    const shadowClear = player?.progression.unlockedDungeons.includes(
      "dungeon:shadow-archive"
    )
    if (!shadowClear) {
      return {
        contractId: route.contractId,
        href: "/dungeons/shadow-archive",
        label: "Clear Shadow Archive sector first",
        available: true,
      }
    }
  }

  return {
    contractId: route.contractId,
    href,
    label: route.label,
    available: true,
  }
}
