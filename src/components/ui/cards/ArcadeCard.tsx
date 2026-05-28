"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { UI_TOKENS } from "@/config/uiTokens"

interface ArcadeCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  accent?: "purple" | "gold"
}

/** Training arcade tiles — play-first, not contract rows. */
export function ArcadeCard({
  children,
  className = "",
  accent = "purple",
  ...rest
}: ArcadeCardProps) {
  const accentClass =
    accent === "gold"
      ? "border-[var(--reward)]/40 shadow-[0_0_20px_var(--reward-gold-a15)]"
      : "border-[var(--accent)]/40 shadow-[0_0_20px_var(--accent-violet-a20)]"
  return (
    <div
      className={`nozomi-card-arcade rounded-2xl border-2 bg-[var(--surface)]/80 ${accentClass} ${UI_TOKENS.cardPadding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
