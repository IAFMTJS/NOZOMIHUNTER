"use client"

import { useEffect } from "react"
import { applyTheme, readStoredTheme } from "@/styles/themePreference"

function applyOsReducedMotion() {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("nozomi-reduced-motion")
  }
}

/** Applies stored theme on client navigation (inline script in layout handles first paint). */
export function ThemeBootstrap() {
  useEffect(() => {
    applyTheme(readStoredTheme())
    applyOsReducedMotion()
  }, [])
  return null
}
