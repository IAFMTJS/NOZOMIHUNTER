"use client"

import type { CSSProperties, ReactNode } from "react"

interface ListeningFocusShellProps {
  children: ReactNode
  subtitle?: string
  onPlaySignal?: () => void
  playing?: boolean
  disabled?: boolean
}

export function ListeningFocusShell({
  children,
  subtitle = "Listening for abnormal energy and hidden clues…",
  onPlaySignal,
  playing = false,
  disabled = false,
}: ListeningFocusShellProps) {
  return (
    <div className="nozomi-encounter-focus flex min-h-[70vh] flex-col items-center justify-center px-4 py-8">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.28em] text-[var(--accent-bright)]">
        Audio intercept
      </p>

      <div className="mb-8 flex h-12 w-full max-w-xs items-end justify-center gap-1" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => {
          const barStyle: CSSProperties = {
            height: `${playing ? 28 + Math.sin(i * 0.8) * 20 : 20 + Math.sin(i * 0.8) * 16 + (i % 3) * 8}px`,
            opacity: playing ? 0.85 : 0.5 + (i % 5) * 0.1,
          }
          return (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[var(--accent)] to-[var(--accent-bright)] transition-all"
              style={barStyle}
            />
          )
        })}
      </div>

      <button
        type="button"
        disabled={disabled || !onPlaySignal}
        onClick={onPlaySignal}
        className={`relative mb-6 flex h-28 w-28 items-center justify-center rounded-full border-2 transition-shadow ${
          playing
            ? "border-[var(--accent-bright)] bg-[var(--glow-accent)] shadow-[0_0_32px_var(--glow-accent)]"
            : "border-[var(--accent)]/50 bg-[var(--glow-accent)] hover:shadow-[0_0_24px_var(--glow-accent)]"
        } ${onPlaySignal ? "cursor-pointer" : "cursor-default"}`}
        aria-label={playing ? "Signal playing" : "Tap to receive signal"}
      >
        <svg viewBox="0 0 48 48" className="relative h-14 w-14 text-[var(--accent-bright)]" aria-hidden>
          <rect x="18" y="8" width="12" height="22" rx="6" fill="currentColor" opacity="0.9" />
          <path
            d="M12 22 Q12 34 24 34 Q36 34 36 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="24" y1="34" x2="24" y2="42" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="42" x2="32" y2="42" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <p className="mb-8 max-w-xs text-center text-sm text-[var(--muted)]">{subtitle}</p>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
