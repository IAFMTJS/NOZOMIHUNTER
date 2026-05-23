/** Maps item_catalog.icon keys to display labels for SVG tiles. */
export const UI_ICON_LABELS: Record<string, string> = {
  blade: "BLD",
  ring: "RNG",
  potion: "POT",
  shard: "SHD",
  cache: "CCH",
  scroll: "SCR",
  crate: "CRT",
}

export function iconLabel(key: string): string {
  return UI_ICON_LABELS[key] ?? key.slice(0, 3).toUpperCase()
}
