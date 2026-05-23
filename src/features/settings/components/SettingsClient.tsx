"use client"

import { useEffect, useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { AudioMuteToggle } from "@/components/ui/AudioMuteToggle"

const REDUCED_MOTION_KEY = "nozomi-reduced-motion"

export function SettingsClient() {
  const { signOut } = useHunterSession()
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(REDUCED_MOTION_KEY) === "1"
    setReducedMotion(stored)
    document.documentElement.classList.toggle("nozomi-reduced-motion", stored)
  }, [])

  function toggleReducedMotion() {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem(REDUCED_MOTION_KEY, next ? "1" : "0")
    document.documentElement.classList.toggle("nozomi-reduced-motion", next)
  }

  return (
    <HunterPage>
      <HunterPageBack href="/profile" label="Profile" />
      <h1 className="font-display text-xl font-semibold tracking-wide">Settings</h1>

      <ul className="mt-6 divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Audio</span>
          <AudioMuteToggle />
        </li>
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Reduced motion</span>
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={toggleReducedMotion}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              reducedMotion ? "bg-[var(--accent)]" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                reducedMotion ? "left-6" : "left-1"
              }`}
            />
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full px-4 py-3 text-left text-sm text-[var(--danger)] hover:bg-white/5"
          >
            Logout
          </button>
        </li>
      </ul>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        NOZOMI Hunter System · v0.1.0
      </p>
    </HunterPage>
  )
}
