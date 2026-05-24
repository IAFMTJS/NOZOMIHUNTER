/** Level-based hunter titles — parallel to rank titles. */
const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 40, title: "Cipher Hunter" },
  { minLevel: 25, title: "Archive Stalker" },
  { minLevel: 15, title: "Initiate Reader" },
  { minLevel: 8, title: "Signal Operative" },
  { minLevel: 1, title: "Registry Cadet" },
]

export function levelDisplayTitle(level: number): string {
  const row = LEVEL_TITLES.find((t) => level >= t.minLevel)
  return row?.title ?? "Registry Cadet"
}
