"use client"

import { useEncounterHint } from "@/context/encounters/EncounterHintContext"

export function HunterVisionControl() {
  const {
    limits,
    visionActive,
    onVisionPointerDown,
    onVisionPointerUp,
    onVisionPointerCancel,
  } = useEncounterHint()

  const disabled = limits.visionBlocked || limits.visionChargesRemaining <= 0

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={visionActive}
        aria-label="Hunter Vision — hold to reveal tactical layers"
        className={`nozomi-hunter-vision select-none rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
          visionActive
            ? "border-[var(--accent-bright)] bg-[var(--accent)]/20 text-[var(--accent-bright)] shadow-[0_0_24px_var(--glow-accent)]"
            : disabled
              ? "cursor-not-allowed border-[var(--border-subtle)] text-[var(--muted)] opacity-50"
              : "border-[var(--border-accent)] text-[var(--foreground)] hover:border-[var(--accent)]"
        }`}
        onPointerDown={(e) => {
          e.preventDefault()
          onVisionPointerDown()
        }}
        onPointerUp={onVisionPointerUp}
        onPointerLeave={onVisionPointerCancel}
        onPointerCancel={onVisionPointerCancel}
      >
        {visionActive ? "Vision active" : "Hold · Hunter Vision"}
      </button>
      <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {limits.visionBlocked
          ? "Assist blackout"
          : `Charges ${limits.visionChargesRemaining}`}
      </span>
    </div>
  )
}
