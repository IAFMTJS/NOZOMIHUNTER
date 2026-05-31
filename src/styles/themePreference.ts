import { DEFAULT_THEME, type ThemeMode } from "@/styles/themeDefaults"

export const THEME_STORAGE_KEY = "nozomi-theme"

const APP_ICON: Record<ThemeMode, string> = {
  dark: "/icons/app-icon-dark.webp",
  light: "/icons/app-icon-light.webp",
}

export function syncAppIcon(mode: ThemeMode): void {
  if (typeof document === "undefined") return
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-nozomi-app-icon]')
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    link.type = "image/webp"
    link.setAttribute("data-nozomi-app-icon", "1")
    document.head.appendChild(link)
  }
  link.href = APP_ICON[mode]
}

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
  syncAppIcon(mode)
}

export function persistTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
  applyTheme(mode)
}
