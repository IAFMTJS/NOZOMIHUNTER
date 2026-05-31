"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { HunterShellLayout } from "@/components/layout/HunterShellLayout"
import { HunterPage } from "@/components/layout/HunterPage"
import type { HunterHydrationPhase } from "@/features/hunter/hooks/useHunterHydration"
import { LoadingScreenOverlay } from "@/components/layout/LoadingScreenOverlay"
import { Button } from "@/components/ui/Button"

export function HunterSessionGate({
  phase,
  children,
  onRetryHydrate,
  hydrateError,
}: {
  phase: HunterHydrationPhase
  children: ReactNode
  onRetryHydrate?: () => void
  hydrateError?: string | null
}) {
  if (phase === "auth-loading") {
    return <LoadingScreenOverlay show />
  }

  if (phase === "hydrating") {
    return <LoadingScreenOverlay show />
  }

  if (phase === "hydrate-error") {
    return (
      <HunterShellLayout>
        <HunterPage>
          <h1 className="font-display text-xl text-[var(--foreground)]">
            Registry sync failed
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {hydrateError ??
              "Could not load hunter status. Check your connection and try again."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {onRetryHydrate && (
              <Button type="button" onClick={onRetryHydrate}>
                Retry sync
              </Button>
            )}
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
            >
              Return to login
            </Link>
          </div>
        </HunterPage>
      </HunterShellLayout>
    )
  }

  if (phase === "unconfigured") {
    return (
      <HunterShellLayout>
        <HunterPage>
          <SupabaseSetupNotice />
        </HunterPage>
      </HunterShellLayout>
    )
  }

  if (phase === "guest") {
    return (
      <HunterShellLayout>
        <HunterPage>
          <p>
            <Link href="/login" className="text-[var(--accent-bright)] hover:underline">
              Sign in
            </Link>{" "}
            to access the hunter system.
          </p>
        </HunterPage>
      </HunterShellLayout>
    )
  }

  return <>{children}</>
}
