"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { UI_TOKENS } from "@/config/uiTokens"

interface ThreatCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  masteryClass?: string
}

/** Vocabulary hub — collectible threat framing. */
export function ThreatCard({
  children,
  className = "",
  masteryClass = "",
  ...rest
}: ThreatCardProps) {
  return (
    <div
      className={`nozomi-card-threat rounded-xl border border-[var(--danger)]/20 ${masteryClass} ${UI_TOKENS.cardPadding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
