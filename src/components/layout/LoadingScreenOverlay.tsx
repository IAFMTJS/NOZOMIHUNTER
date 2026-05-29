"use client"

import { useEffect, useState } from "react"
import { loadingPanelAssetKeys, resolveAssetUrl } from "@/systems/content/assetManifestSystem"
import Image from "next/image"

const LORE_TIPS = [
  "The Archive fractured — language became weaponized.",
  "Corruption rises when operators hesitate.",
  "Relics remember sectors you have not cleared yet.",
  "Discipline chains unlock supply caches.",
  "Boss traces intensify on greedy routes.",
]

export function LoadingScreenOverlay({ show }: { show: boolean }) {
  const keys = loadingPanelAssetKeys()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!show || keys.length === 0) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % keys.length), 4000)
    return () => window.clearInterval(id)
  }, [show, keys.length])

  if (!show) return null

  const assetKey = keys[idx] ?? keys[0]
  const src = assetKey ? resolveAssetUrl(assetKey) : null
  const tip = LORE_TIPS[idx % LORE_TIPS.length]

  return (
    <div
      data-testid="loading-screen-overlay"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[var(--background)] p-6"
    >
      {src && (
        <div className="relative mb-6 h-40 w-full max-w-md overflow-hidden rounded-xl">
          <Image src={src} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
      <p className="font-display text-lg text-[var(--foreground)]">Synchronizing registry…</p>
      <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted)]">{tip}</p>
    </div>
  )
}
