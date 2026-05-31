"use client"

import { useEffect, useState } from "react"
import { DEFAULT_THEME, type ThemeMode } from "@/styles/themeDefaults"
import { isThemeMode, readStoredTheme } from "@/styles/themePreference"

function readDomTheme(): ThemeMode {
  if (typeof document === "undefined") return DEFAULT_THEME
  const attr = document.documentElement.getAttribute("data-theme")
  return isThemeMode(attr) ? attr : readStoredTheme()
}

/** Subscribes to `data-theme` on `<html>` (settings toggle + bootstrap script). */
export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME)

  useEffect(() => {
    const sync = () => setMode(readDomTheme())
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  return mode
}
