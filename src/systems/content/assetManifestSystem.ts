import {
  fallbackAssetEntry,
  fallbackAssetManifest,
  type AssetManifestEntry,
} from "@/config/assetManifestFallback"
import { getActiveSeason } from "@/config/seasonConfig"
import type { HunterRank } from "@/contracts/player-contract"
import type { ThemeMode } from "@/styles/themeDefaults"
import { DEFAULT_THEME } from "@/styles/themeDefaults"
import { resolveThemedAssetPath } from "@/systems/content/themedAssetPath"

const RANK_ORDER: HunterRank[] = [
  "E",
  "D",
  "C",
  "B",
  "A",
  "S",
  "SS",
  "SSS",
]

let dbCache: AssetManifestEntry[] | null = null

export function setAssetManifestCache(entries: AssetManifestEntry[] | null): void {
  dbCache = entries
}

export function listAssetManifestEntries(): AssetManifestEntry[] {
  return dbCache ?? fallbackAssetManifest()
}

function rankMeetsMin(playerRank: HunterRank | undefined, minRank?: string): boolean {
  if (!minRank) return true
  if (!playerRank) return false
  const need = RANK_ORDER.indexOf(minRank as HunterRank)
  const have = RANK_ORDER.indexOf(playerRank)
  if (need < 0 || have < 0) return true
  return have >= need
}

function applyThemeToPath(path: string, themeMode: ThemeMode): string {
  if (!path.startsWith("/")) return path
  return resolveThemedAssetPath(path, themeMode)
}

export function resolveAssetUrl(
  assetKey: string,
  options?: {
    playerRank?: HunterRank
    seasonId?: string
    themeMode?: ThemeMode
  }
): string | null {
  const themeMode = options?.themeMode ?? DEFAULT_THEME
  const seasonId = options?.seasonId ?? getActiveSeason()?.id
  const entries = listAssetManifestEntries()
  const match =
    entries.find(
      (e) =>
        e.asset_key === assetKey &&
        (!e.season_id || !seasonId || e.season_id === seasonId) &&
        rankMeetsMin(options?.playerRank, e.min_rank)
    ) ?? fallbackAssetEntry(assetKey)

  if (!match) return null

  const fallback = fallbackAssetEntry(assetKey)
  // Prefer bundled /public paths — avoids Next image optimizer 400s on remote storage.
  if (fallback?.path.startsWith("/")) {
    return applyThemeToPath(fallback.path, themeMode)
  }

  return applyThemeToPath(match.path, themeMode)
}

export function resolveAssetsByCategory(
  category: string,
  options?: { playerRank?: HunterRank }
): AssetManifestEntry[] {
  return listAssetManifestEntries().filter(
    (e) =>
      e.category === category && rankMeetsMin(options?.playerRank, e.min_rank)
  )
}

export function loadingPanelAssetKeys(): string[] {
  return listAssetManifestEntries()
    .filter((e) => e.category === "loading")
    .map((e) => e.asset_key)
}
