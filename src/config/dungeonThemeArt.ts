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
    accentGlow: "rgba(122, 92, 255, 0.35)",
  },
  NEON_CITY: {
    gradientClass: "nozomi-theme-neon-city",
    vignetteClass: "nozomi-theme-vignette-purple",
    accentGlow: "rgba(155, 125, 255, 0.4)",
  },
  SHADOW_ARCHIVE: {
    gradientClass: "nozomi-theme-shadow-archive",
    vignetteClass: "nozomi-theme-vignette-cold",
    accentGlow: "rgba(88, 120, 200, 0.3)",
  },
  ABYSS_CORE: {
    gradientClass: "nozomi-theme-abyss-core",
    vignetteClass: "nozomi-theme-vignette-danger",
    accentGlow: "rgba(255, 77, 109, 0.25)",
  },
  ABANDONED_STATION: {
    gradientClass: "nozomi-theme-abandoned-station",
    vignetteClass: "nozomi-theme-vignette-cold",
    accentGlow: "rgba(120, 128, 154, 0.35)",
  },
  CORRUPTED_SHRINE: {
    gradientClass: "nozomi-theme-corrupted-shrine",
    vignetteClass: "nozomi-theme-vignette-danger",
    accentGlow: "rgba(168, 85, 247, 0.35)",
  },
}

export function getDungeonThemeArt(theme: DungeonTheme): DungeonThemeArtConfig {
  return THEME_ART[theme]
}
