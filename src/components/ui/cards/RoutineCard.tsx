"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { UI_TOKENS } from "@/config/uiTokens"

interface RoutineCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Daily / maintenance — compact, low ceremony. */
export function RoutineCard({ children, className = "", ...rest }: RoutineCardProps) {
  return (
    <div
      className={`nozomi-card-routine rounded-xl border border-white/8 bg-[var(--surface)]/60 ${UI_TOKENS.cardPadding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
