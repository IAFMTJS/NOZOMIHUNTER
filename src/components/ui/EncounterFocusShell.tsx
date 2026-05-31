"use client"

import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/Button"
import { unlockAudio } from "@/systems/audio/audioSystem"

interface EncounterFocusShellProps {
  title: string
  children: ReactNode
  footer?: ReactNode
  /** Show focus control (hidden during prep briefing). */
  enabled?: boolean
  /** Enter focus mode when encounter UI mounts — off by default (iOS / overflow safe). */
  autoFocus?: boolean
  encounterClassName?: string
}

function FocusOverlay({
  title,
  children,
  footer,
  encounterClassName,
  onExit,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
  encounterClassName?: string
  onExit: () => void
}) {
  return (
    <div
      className={`nozomi-encounter-focus fixed inset-0 z-[200] flex flex-col bg-[var(--background)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 ${encounterClassName}`}
      role="dialog"
      aria-modal
      aria-label={`${title} — focused encounter`}
    >
      <header className="mx-auto mb-3 flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 pb-2">
        <h2 className="min-w-0 truncate font-display text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <Button variant="ghost" size="md" onClick={onExit}>
          Exit focus
        </Button>
      </header>

      <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>

      {footer && (
        <div className="mx-auto mt-4 w-full max-w-3xl shrink-0 pt-2">{footer}</div>
      )}
    </div>
  )
}

export function EncounterFocusShell({
  title,
  children,
  footer,
  enabled = true,
  autoFocus = false,
  encounterClassName = "",
}: EncounterFocusShellProps) {
  const [focused, setFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (enabled && autoFocus) {
      setFocused(true)
      unlockAudio()
    }
  }, [enabled, autoFocus])

  useEffect(() => {
    if (!focused) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [focused])

  if (!enabled) {
    return <>{children}</>
  }

  const inline = (
    <>
      <div className="min-h-[12rem]">{children}</div>
      {!focused && (
        <Button
          variant="ghost"
          size="md"
          className="mt-3 w-full sm:w-auto"
          onClick={() => {
            unlockAudio()
            setFocused(true)
          }}
        >
          Enter hunt mode
        </Button>
      )}
      {!focused && footer}
    </>
  )

  if (focused && mounted) {
    return createPortal(
      <FocusOverlay
        title={title}
        footer={footer}
        encounterClassName={encounterClassName}
        onExit={() => setFocused(false)}
      >
        {children}
      </FocusOverlay>,
      document.body
    )
  }

  return inline
}
