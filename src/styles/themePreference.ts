import { DEFAULT_THEME, type ThemeMode } from "@/styles/themeDefaults"

export const THEME_STORAGE_KEY = "nozomi-theme"

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light"
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-theme", mode)
}

export function persistTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
  applyTheme(mode)
}
