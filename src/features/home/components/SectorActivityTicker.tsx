"use client"

import Link from "next/link"
import type { SectorActivityItem } from "@/systems/home/operationalFeedSystem"

interface SectorActivityTickerProps {
  items: SectorActivityItem[]
}

export function SectorActivityTicker({ items }: SectorActivityTickerProps) {
  if (!items.length) return null

  return (
    <div className="nozomi-embedded overflow-hidden rounded-xl p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Sector activity
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={
              item.id.startsWith("dungeon:")
                ? `/dungeons/${encodeURIComponent(item.id)}`
                : "/dungeons"
            }
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <p className="whitespace-nowrap text-xs text-[var(--foreground)]">{item.label}</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
              {item.status}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
