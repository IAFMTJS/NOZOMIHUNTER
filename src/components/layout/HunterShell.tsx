"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { AtmosphericBackground } from "@/components/layout/AtmosphericBackground"
import { AudioMuteToggle } from "@/components/ui/AudioMuteToggle"

interface HunterShellProps {
  pageTitle?: string
  username?: string
  rank?: string
  level?: number
  onSignOut?: () => void
  hud?: ReactNode
  children: ReactNode
  maxWidth?: "md" | "lg"
  /** Contract board atmosphere + penalty-driven shell classes */
  atmosphere?: boolean
  shellClassName?: string
}

export function HunterShell({
  pageTitle,
  username,
  rank,
  level,
  onSignOut,
  hud,
  children,
  maxWidth = "lg",
  atmosphere = true,
  shellClassName = "",
}: HunterShellProps) {
  const maxClass = maxWidth === "lg" ? "max-w-3xl" : "max-w-2xl"

  const metaParts: string[] = []
  if (username) metaParts.push(username)
  if (rank != null) metaParts.push(`Rank ${rank}`)
  if (level != null) metaParts.push(`Lv ${level}`)

  const inner = (
    <div className="min-h-screen">
      <header className="pt-safe border-b border-[var(--border-subtle)] bg-[var(--surface-header)]/90 backdrop-blur-sm">
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-6 ${maxClass}`}
        >
          <span className="font-display text-lg font-semibold tracking-[0.12em] text-[var(--foreground)]">
            NOZOMI
          </span>

          {metaParts.length > 0 && (
            <p className="hidden min-w-0 flex-1 truncate text-center text-sm text-[var(--muted)] sm:block">
              {metaParts.join(" · ")}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="hidden text-sm text-[var(--accent-bright)] hover:underline sm:inline"
            >
              Profile
            </Link>
            <AudioMuteToggle />
            {onSignOut ? (
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                Sign out
              </Button>
            ) : (
              <span className="w-16" aria-hidden />
            )}
          </div>
        </div>

        {metaParts.length > 0 && (
          <p className="mx-auto truncate px-4 pb-2 text-center text-sm text-[var(--muted)] sm:hidden">
            {metaParts.join(" · ")}
          </p>
        )}
      </header>

      {hud && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-1)]/80 backdrop-blur-sm">
          <div className={`mx-auto px-4 py-3 sm:px-6 ${maxClass}`}>{hud}</div>
        </div>
      )}

      <main className={`mx-auto px-4 py-6 pb-safe sm:px-6 sm:py-8 ${maxClass}`}>
        {pageTitle && (
          <h1 className="mb-6 font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:mb-8 sm:text-2xl">
            {pageTitle}
          </h1>
        )}
        {children}
      </main>
    </div>
  )

  if (!atmosphere) {
    return (
      <div className="min-h-screen bg-[var(--background)]">{inner}</div>
    )
  }

  return (
    <AtmosphericBackground variant="lobby" className={shellClassName}>
      {inner}
    </AtmosphericBackground>
  )
}
