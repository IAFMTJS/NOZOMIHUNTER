import type { ReactNode } from "react"
import { Button } from "@/components/ui/Button"

interface ScreenCTAProps {
  label: string
  onClick: () => void
  disabled?: boolean
  staminaCost?: number
  children?: ReactNode
  className?: string
}

export function ScreenCTA({
  label,
  onClick,
  disabled,
  staminaCost,
  children,
  className = "",
}: ScreenCTAProps) {
  return (
    <div
      className={`hunter-overlay-above-nav fixed left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-gradient-to-t from-[var(--background)] via-[var(--background)]/95 to-transparent px-4 pb-safe pt-3 ${className}`.trim()}
    >
      <div className="mx-auto max-w-lg space-y-2">
        {children}
        <Button
          variant="cta"
          size="md"
          className="nozomi-btn-cta w-full !py-3.5"
          disabled={disabled}
          onClick={onClick}
        >
          {label}
          {staminaCost != null && (
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-black/30 px-2 py-0.5 text-xs font-bold">
              <LightningIcon />
              {staminaCost}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

function LightningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}
