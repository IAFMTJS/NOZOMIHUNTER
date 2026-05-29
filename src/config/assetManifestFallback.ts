import manifest from "../../content/seeds/asset-manifest.json"

export interface AssetManifestEntry {
  asset_key: string
  category: string
  variant: string
  path: string
  season_id?: string
  min_rank?: string
  checksum?: string
}

const ENTRIES = manifest as AssetManifestEntry[]

const BY_KEY = new Map(ENTRIES.map((e) => [e.asset_key, e]))

export function fallbackAssetManifest(): AssetManifestEntry[] {
  return [...ENTRIES]
}

export function fallbackAssetEntry(key: string): AssetManifestEntry | null {
  return BY_KEY.get(key) ?? null
}
