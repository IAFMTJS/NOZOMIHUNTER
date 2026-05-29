"use client"

import Image from "next/image"
import type { HunterRank } from "@/contracts/player-contract"
import { resolveAssetUrl } from "@/systems/content/assetManifestSystem"

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
  const src = resolveAssetUrl(assetKey, { playerRank })
  if (!src) return null

  const unoptimized =
    src.startsWith("http") || /\.(svg|webp|avif)$/i.test(src)

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${className}`}
        unoptimized={unoptimized}
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
    />
  )
}
