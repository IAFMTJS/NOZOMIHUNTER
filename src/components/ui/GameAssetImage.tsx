"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type { HunterRank } from "@/contracts/player-contract"
import { resolveAssetUrl } from "@/systems/content/assetManifestSystem"
import { useThemeMode } from "@/styles/useThemeMode"

interface GameAssetImageProps {
  assetKey: string
  alt: string
  className?: string
  playerRank?: HunterRank
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
}

export function GameAssetImage({
  assetKey,
  alt,
  className = "",
  playerRank,
  priority,
  fill,
  width = 640,
  height = 360,
}: GameAssetImageProps) {
  const themeMode = useThemeMode()
  const primarySrc = resolveAssetUrl(assetKey, { playerRank, themeMode })
  const fallbackSrc = resolveAssetUrl(assetKey, { playerRank, themeMode: "dark" })
  const [src, setSrc] = useState(primarySrc)

  useEffect(() => {
    setSrc(primarySrc)
  }, [primarySrc])

  if (!src) return null

  const unoptimized =
    src.startsWith("http") || /\.(svg|webp|avif)$/i.test(src)

  const handleError = () => {
    if (fallbackSrc && fallbackSrc !== src) setSrc(fallbackSrc)
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${className}`}
        unoptimized={unoptimized}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      unoptimized={unoptimized}
      onError={handleError}
    />
  )
}
