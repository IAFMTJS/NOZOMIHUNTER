"use client"

import type { InstabilityFeedItem } from "@/systems/home/operationalFeedSystem"

interface InstabilityFeedProps {
  items: InstabilityFeedItem[]
}

const SEVERITY_CLASS = {
  low: "text-[var(--muted)]",
  medium: "text-[var(--warning)]",
  high: "text-[var(--danger)]",
} as const

export function InstabilityFeed({ items }: InstabilityFeedProps) {
  if (!items.length) return null

  return (
    <div className="nozomi-embedded rounded-xl p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Instability index
      </p>
      <ul className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {item.label}
            </p>
            <p className={`mt-1 font-mono text-sm tabular-nums ${SEVERITY_CLASS[item.severity]}`}>
              {item.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
