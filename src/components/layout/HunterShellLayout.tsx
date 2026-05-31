"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BottomNav } from "@/components/layout/BottomNav"
import { AudioMuteToggle } from "@/components/ui/AudioMuteToggle"
import { AtmosphericBackground } from "@/components/layout/AtmosphericBackground"
import { ReactiveFeedbackHost } from "@/components/layout/ReactiveFeedbackHost"

function resolvePageTitle(pathname: string): string {
  if (pathname === "/home" || pathname === "/dashboard") return "NOZOMI HUNTER SYSTEM"
  if (pathname === "/contracts" || pathname === "/missions") return "MISSIONS"
  if (pathname.startsWith("/contracts/") || pathname.startsWith("/missions/"))
    return "MISSION FILE"
  if (pathname === "/dungeons") return "DUNGEONS"
  if (pathname.startsWith("/dungeons/")) return "SECTOR"
  if (pathname === "/prepare") return "DEPLOYMENT"
  if (pathname === "/vocabulary") return "THREAT INDEX"
  if (pathname.startsWith("/vocabulary/")) return "THREAT ENTRY"
  if (pathname === "/inventory") return "INVENTORY"
  if (pathname === "/system") return "SYSTEM STATUS"
  if (pathname === "/profile") return "PROFILE"
  if (pathname === "/achievements") return "ACHIEVEMENTS"
  if (pathname === "/stats") return "STATS"
  if (pathname === "/settings") return "SETTINGS"
  if (pathname === "/training") return "TRAINING"
  if (pathname === "/records") return "RECORDS"
  return "NOZOMI"
}

interface HunterShellLayoutProps {
  children: ReactNode
  atmosphereClassName?: string
  /** Fixed overlays (encounters, ceremonies) — outside scrollable page content. */
  overlay?: ReactNode
  headerClassName?: string
  headerRight?: ReactNode
}

/** Viewport-locked shell: header + scrollable main + persistent bottom nav. */
export function HunterShellLayout({
  children,
  atmosphereClassName = "",
  overlay,
  headerClassName = "",
  headerRight,
}: HunterShellLayoutProps) {
  const pathname = usePathname()
  const title = resolvePageTitle(pathname)

  useEffect(() => {
    document.body.classList.add("hunter-shell-lock")
    return () => document.body.classList.remove("hunter-shell-lock")
  }, [])

  return (
    <AtmosphericBackground
      variant="lobby"
      className={`h-dvh max-h-dvh overflow-hidden ${atmosphereClassName}`}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <a
          href="#hunter-main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--foreground)]"
        >
          Skip to main content
        </a>
        <header
          className={`pt-safe relative z-20 shrink-0 bg-gradient-to-b from-[var(--surface-header)] to-transparent backdrop-blur-md ${headerClassName}`}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-2 sm:py-3">
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-[var(--foreground)]">
              {title}
            </span>
            <div className="flex items-center gap-2">
              {headerRight}
              <Link
                href="/system"
                className="flex min-h-9 min-w-9 items-center justify-center rounded border border-[var(--border-subtle)] text-[var(--muted)] hover:text-[var(--accent-bright)]"
                aria-label="System status"
              >
                <BellIcon />
              </Link>
              <AudioMuteToggle />
            </div>
          </div>
        </header>

        <main
          id="hunter-main-content"
          className="hunter-main relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden px-3 pt-1 sm:px-4 sm:pt-2"
        >
          {overlay}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </main>

        <ReactiveFeedbackHost />
        <BottomNav />
      </div>
    </AtmosphericBackground>
  )
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M12 3a5 5 0 00-5 5v3l-2 2h14l-2-2V8a5 5 0 00-5-5zM10 19a2 2 0 004 0" />
    </svg>
  )
}
