"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { UI_TOKENS } from "@/config/uiTokens"

interface OperativeCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Contracts / story ops — narrative weight. */
export function OperativeCard({ children, className = "", ...rest }: OperativeCardProps) {
  return (
    <div
      className={`nozomi-card-operative rounded-xl border border-[var(--accent)]/25 bg-gradient-to-b from-[var(--accent-dim)]/40 to-transparent ${UI_TOKENS.cardPadding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
