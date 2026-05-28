import type { DungeonTheme } from "@/contracts/dungeon-contract"

export interface DungeonThemeArtConfig {
  gradientClass: string
  vignetteClass: string
  accentGlow: string
}

const THEME_ART: Record<DungeonTheme, DungeonThemeArtConfig> = {
  CYBER_TOKYO: {
    gradientClass: "nozomi-theme-cyber-tokyo",
    vignetteClass: "nozomi-theme-vignette-purple",
    accentGlow: "var(--accent-a35)",
  },
  NEON_CITY: {
    gradientClass: "nozomi-theme-neon-city",
    vignetteClass: "nozomi-theme-vignette-purple",
    accentGlow: "var(--accent-bright-a40)",
  },
  SHADOW_ARCHIVE: {
    gradientClass: "nozomi-theme-shadow-archive",
    vignetteClass: "nozomi-theme-vignette-cold",
    accentGlow: "var(--cold-blue-a30)",
  },
  ABYSS_CORE: {
    gradientClass: "nozomi-theme-abyss-core",
    vignetteClass: "nozomi-theme-vignette-danger",
    accentGlow: "var(--danger-a25)",
  },
  ABANDONED_STATION: {
    gradientClass: "nozomi-theme-abandoned-station",
    vignetteClass: "nozomi-theme-vignette-cold",
    accentGlow: "var(--muted-a30)",
  },
  CORRUPTED_SHRINE: {
    gradientClass: "nozomi-theme-corrupted-shrine",
    vignetteClass: "nozomi-theme-vignette-danger",
    accentGlow: "var(--corruption-a35)",
  },
}

export function getDungeonThemeArt(theme: DungeonTheme): DungeonThemeArtConfig {
  return THEME_ART[theme]
}
