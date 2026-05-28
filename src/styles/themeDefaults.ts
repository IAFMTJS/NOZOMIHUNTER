export type ThemeMode = "dark" | "light"

/** PWA / OG surfaces that cannot read CSS variables — keep in sync with --background per mode. */
export const THEME_COLORS: Record<ThemeMode, { background: string; accent: string }> = {
  dark: {
    background: "#05070b",
    accent: "#7a5cff",
  },
  light: {
    background: "#f3f5ff",
    accent: "#5b3fd4",
  },
} as const

export const DEFAULT_THEME: ThemeMode = "dark"

export const DEFAULT_THEME_BACKGROUND = THEME_COLORS[DEFAULT_THEME].background
