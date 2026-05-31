"use client"

import { useCallback, type KeyboardEvent } from "react"

interface TabBarItem<T extends string> {
  id: T
  label: string
}

interface TabBarProps<T extends string> {
  tabs: TabBarItem<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: TabBarProps<T>) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      event.preventDefault()
      const delta = event.key === "ArrowRight" ? 1 : -1
      const next = tabs[(index + delta + tabs.length) % tabs.length]
      if (next) onChange(next.id)
    },
    [onChange, tabs]
  )

  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active
        const index = tabs.findIndex((t) => t.id === tab.id)
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              selected
                ? "bg-[var(--accent)]/25 text-[var(--accent-bright)] shadow-[0_0_12px_var(--glow-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
