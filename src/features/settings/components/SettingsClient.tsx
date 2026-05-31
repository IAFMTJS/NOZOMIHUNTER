"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import {
  CORRUPTION_AUDIO_KEY,
  setCorruptionAudioEnabled,
  syncCorruptionAudio,
} from "@/systems/audio/registerAudioHandlers"
import type { ThemeMode } from "@/styles/themeDefaults"
import { persistTheme, readStoredTheme } from "@/styles/themePreference"
import {
  isPushConfigured,
  isPushOptIn,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/systems/retention/pushNotificationSystem"

const REDUCED_MOTION_KEY = "nozomi-reduced-motion"

export function SettingsClient() {
  const { signOut, player } = useHunterSession()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [corruptionAudio, setCorruptionAudio] = useState(true)
  const [colorMode, setColorMode] = useState<ThemeMode>("dark")
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const pushAvailable = isPushSupported()
  const pushConfigured = isPushConfigured()

  useEffect(() => {
    setColorMode(readStoredTheme())

    const stored = localStorage.getItem(REDUCED_MOTION_KEY) === "1"
    setReducedMotion(stored)
    document.documentElement.classList.toggle("nozomi-reduced-motion", stored)

    const corruptionStored = localStorage.getItem(CORRUPTION_AUDIO_KEY)
    const enabled = corruptionStored === null || corruptionStored === "1"
    setCorruptionAudio(enabled)

    setPushEnabled(isPushOptIn())
  }, [])

  function toggleReducedMotion() {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem(REDUCED_MOTION_KEY, next ? "1" : "0")
    document.documentElement.classList.toggle("nozomi-reduced-motion", next)
  }

  function toggleCorruptionAudio() {
    const next = !corruptionAudio
    setCorruptionAudio(next)
    setCorruptionAudioEnabled(next)
    if (player) syncCorruptionAudio(player.penalties.corruption)
  }

  function toggleColorMode() {
    const next: ThemeMode = colorMode === "dark" ? "light" : "dark"
    setColorMode(next)
    persistTheme(next)
  }

  async function togglePushAlerts() {
    if (!player?.id || pushBusy) return
    setPushBusy(true)
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(player.id)
        setPushEnabled(false)
      } else if (pushConfigured) {
        const ok = await subscribeToPush(player.id)
        setPushEnabled(ok)
      }
    } finally {
      setPushBusy(false)
    }
  }

  return (
    <HunterPage>
      <HunterPageBack href="/profile" label="Profile" />
      <h1 className="font-display text-xl font-semibold tracking-wide">Settings</h1>

      <ul className="nozomi-embedded mt-6 divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        <li>
          <Link
            href="/system"
            className="flex items-center justify-between px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--overlay-subtle)]"
          >
            System status
            <span className="text-[var(--muted)]">›</span>
          </Link>
        </li>
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Corruption ambient audio</span>
          <button
            type="button"
            role="switch"
            aria-checked={corruptionAudio}
            onClick={toggleCorruptionAudio}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              corruptionAudio ? "bg-[var(--accent)]" : "bg-[var(--overlay-toggle-off)]"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                corruptionAudio ? "left-6" : "left-1"
              }`}
            />
          </button>
        </li>
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <span className="block">Light mode</span>
            <span className="text-xs text-[var(--muted)]">
              {colorMode === "light" ? "On" : "Off"} — tactical light palette
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={colorMode === "light"}
            aria-label="Light mode"
            onClick={toggleColorMode}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              colorMode === "light" ? "bg-[var(--accent)]" : "bg-[var(--overlay-toggle-off)]"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-[var(--foreground)] transition-transform ${
                colorMode === "light" ? "left-6" : "left-1"
              }`}
            />
          </button>
        </li>
        {pushAvailable && (
          <li className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="block">Invasion alerts</span>
              <span className="text-xs text-[var(--muted)]">
                {pushConfigured
                  ? "Push via GitHub scheduler — deep links to /home anomalies"
                  : "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY to enable"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pushEnabled}
              aria-label="Invasion push alerts"
              disabled={!pushConfigured || pushBusy}
              onClick={() => void togglePushAlerts()}
              className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-40 ${
                pushEnabled ? "bg-[var(--accent)]" : "bg-[var(--overlay-toggle-off)]"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  pushEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </li>
        )}
        <li className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Reduced motion</span>
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={toggleReducedMotion}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              reducedMotion ? "bg-[var(--accent)]" : "bg-[var(--overlay-toggle-off)]"
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
            className="w-full px-4 py-3 text-left text-sm text-[var(--danger)] hover:bg-[var(--overlay-subtle)]"
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
