"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/Button"
import { unlockAudio } from "@/systems/audio/audioSystem"

interface EncounterFocusShellProps {
  title: string
  children: ReactNode
  footer?: ReactNode
  /** Show focus control (hidden during prep briefing). */
  enabled?: boolean
  /** Enter focus mode when encounter UI mounts. */
  autoFocus?: boolean
  encounterClassName?: string
}

export function EncounterFocusShell({
  title,
  children,
  footer,
  enabled = true,
  autoFocus = true,
  encounterClassName = "",
}: EncounterFocusShellProps) {
  const [focused, setFocused] = useState(false)

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

  return (
    <div
      className={
        focused
          ? `nozomi-encounter-focus fixed inset-0 z-50 flex flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 ${encounterClassName}`
          : "relative"
      }
      role={focused ? "dialog" : undefined}
      aria-modal={focused ? true : undefined}
      aria-label={focused ? `${title} — focused encounter` : undefined}
    >
      {focused && (
        <header className="mx-auto mb-6 flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 pb-2">
          <h2 className="min-w-0 truncate font-display text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <Button variant="ghost" size="md" onClick={() => setFocused(false)}>
            Exit focus
          </Button>
        </header>
      )}

      <div
        className={
          focused
            ? "mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain"
            : undefined
        }
      >
        {children}
      </div>

      {focused ? (
        footer && (
          <div className="mx-auto mt-6 w-full max-w-3xl shrink-0 pt-4">
            {footer}
          </div>
        )
      ) : (
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
    </div>
  )
}
