"use client"

import { useEffect } from "react"
import { applyTheme, readStoredTheme } from "@/styles/themePreference"

/** Applies stored theme on client navigation (inline script in layout handles first paint). */
export function ThemeBootstrap() {
  useEffect(() => {
    applyTheme(readStoredTheme())
  }, [])
  return null
}
