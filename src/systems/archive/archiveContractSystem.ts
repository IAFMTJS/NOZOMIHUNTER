import type { PlayerContract } from "@/contracts/player-contract"
import type { ArchiveEntry } from "@/systems/archive/archiveSystem"

export interface ArchiveContractLink {
  contractId: string
  href: string
  label: string
  available: boolean
  reason?: string
}

const ARCHIVE_CONTRACT_ROUTES: Record<
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
  "night-report": {
    contractId: "daily:night-scan",
    tab: "daily",
    label: "Request night scan ritual",
  },
}

export function resolveArchiveContractLink(
  entry: ArchiveEntry,
  player: PlayerContract | null
): ArchiveContractLink | null {
  const key = entry.linkedContractId ?? entry.id
  const route = ARCHIVE_CONTRACT_ROUTES[key] ?? ARCHIVE_CONTRACT_ROUTES[entry.id]
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

  if (key === "forbidden-kanji") {
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
