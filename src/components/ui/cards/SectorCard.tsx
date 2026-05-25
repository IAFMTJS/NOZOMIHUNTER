"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { UI_TOKENS } from "@/config/uiTokens"

interface SectorCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Dungeon sectors — high tension silhouette. */
export function SectorCard({ children, className = "", ...rest }: SectorCardProps) {
  return (
    <div
      className={`nozomi-card-sector rounded-xl border border-[var(--danger)]/35 bg-black/40 shadow-[0_0_24px_rgba(255,77,109,0.12)] ${UI_TOKENS.cardPadding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
