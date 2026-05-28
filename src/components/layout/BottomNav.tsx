"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/contracts", label: "Missions", icon: QuestIcon },
  { href: "/dungeons", label: "Dungeons", icon: DungeonIcon },
  { href: "/vocabulary", label: "Vocab", icon: VocabIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/dashboard"
  if (href === "/contracts")
    return (
      pathname === "/contracts" ||
      pathname.startsWith("/contracts/") ||
      pathname === "/missions" ||
      pathname.startsWith("/missions/")
    )
  if (href === "/vocabulary")
    return pathname === "/vocabulary" || pathname.startsWith("/vocabulary/")
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="pb-safe fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--border-subtle)] bg-[var(--nav-bar)] backdrop-blur-md"
      aria-label="Hunter navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "text-[var(--accent-bright)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon active={active} />
                <span>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={active ? "drop-shadow-[0_0_6px_var(--accent)]" : ""}
    >
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  )
}

function QuestIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={active ? "drop-shadow-[0_0_6px_var(--accent)]" : ""}
    >
      <path d="M6 4h12v16l-6-3-6 3V4z" />
    </svg>
  )
}

function DungeonIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={active ? "drop-shadow-[0_0_6px_var(--accent)]" : ""}
    >
      <path d="M12 3L4 9v12h16V9l-8-6zM12 11v6M9 14h6" />
    </svg>
  )
}

function VocabIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={active ? "drop-shadow-[0_0_6px_var(--accent)]" : ""}
    >
      <path d="M4 5h16v14H4zM8 9h8M8 13h5" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={active ? "drop-shadow-[0_0_6px_var(--accent)]" : ""}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  )
}
