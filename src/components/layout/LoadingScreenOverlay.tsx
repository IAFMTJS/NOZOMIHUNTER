"use client"

import { useEffect, useState } from "react"
import { loadingPanelAssetKeys, resolveAssetUrl } from "@/systems/content/assetManifestSystem"
import { useThemeMode } from "@/styles/useThemeMode"
import Image from "next/image"

const LORE_TIPS = [
  "The Archive fractured — language became weaponized.",
  "Corruption rises when operators hesitate.",
  "Relics remember sectors you have not cleared yet.",
  "Discipline chains unlock supply caches.",
  "Boss traces intensify on greedy routes.",
]

export function LoadingScreenOverlay({ show }: { show: boolean }) {
  const themeMode = useThemeMode()
  const keys = loadingPanelAssetKeys()
  const [idx, setIdx] = useState(0)
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!show || keys.length === 0) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % keys.length), 4000)
    return () => window.clearInterval(id)
  }, [show, keys.length])

  const assetKey = keys[idx] ?? keys[0]
  const primarySrc = assetKey
    ? resolveAssetUrl(assetKey, { themeMode })
    : null
  const darkSrc = assetKey
    ? resolveAssetUrl(assetKey, { themeMode: "dark" })
    : null

  useEffect(() => {
    setImgSrc(primarySrc)
  }, [primarySrc])

  if (!show) return null

  const tip = LORE_TIPS[idx % LORE_TIPS.length]

  return (
    <div
      data-testid="loading-screen-overlay"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[var(--background)] p-6"
    >
      {imgSrc && (
        <div className="relative mb-6 h-40 w-full max-w-md overflow-hidden rounded-xl">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            unoptimized
            onError={() => {
              if (darkSrc && darkSrc !== imgSrc) setImgSrc(darkSrc)
            }}
          />
        </div>
      )}
      <p className="font-display text-lg text-[var(--foreground)]">Synchronizing registry…</p>
      <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted)]">{tip}</p>
    </div>
  )
}
