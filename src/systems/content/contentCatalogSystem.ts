import { listArchiveEntries, type ArchiveEntry } from "@/systems/archive/archiveSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  loadArchiveEntriesFromDb,
  loadAssetManifestFromDb,
  loadBossPhasesFromDb,
  loadContentContractsFromDb,
  loadContentAchievementsFromDb,
} from "@/services/supabase/contentRepository"

export interface ContentCatalogSnapshot {
  archiveEntries: ArchiveEntry[]
  loadedFromDb: boolean
}

let catalogLoaded = false

export async function hydrateContentCatalog(
  player: PlayerContract | null = null
): Promise<void> {
  if (catalogLoaded) return
  try {
    await Promise.all([
      loadAssetManifestFromDb(),
      loadArchiveEntriesFromDb(player?.rank ?? "E"),
      loadBossPhasesFromDb(),
      loadContentContractsFromDb(),
      loadContentAchievementsFromDb(),
    ])
    catalogLoaded = true
  } catch {
    catalogLoaded = false
  }
}

/** Merges DB rows over in-memory fallbacks (DB optional until ingest runs). */
export function loadContentCatalog(
  player: PlayerContract | null
): ContentCatalogSnapshot {
  return {
    archiveEntries: listArchiveEntries(player),
    loadedFromDb: catalogLoaded,
  }
}
