"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { HunterShellLayout } from "@/components/layout/HunterShellLayout"
import { HunterPage } from "@/components/layout/HunterPage"
import type { HunterHydrationPhase } from "@/features/hunter/hooks/useHunterHydration"
import { LoadingScreenOverlay } from "@/components/layout/LoadingScreenOverlay"

export function HunterSessionGate({
  phase,
  shellClassName,
  children,
}: {
  phase: HunterHydrationPhase
  shellClassName?: string
  children: ReactNode
}) {
  if (phase === "auth-loading") {
    return <LoadingScreenOverlay show />
  }

  if (phase === "hydrating") {
    return <LoadingScreenOverlay show />
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
