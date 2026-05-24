"use client"

import Link from "next/link"
import type { ContractRotationItem } from "@/systems/home/operationalFeedSystem"

interface ContractRotationRailProps {
  items: ContractRotationItem[]
}

export function ContractRotationRail({ items }: ContractRotationRailProps) {
  if (!items.length) return null

  return (
    <div className="nozomi-embedded rounded-xl p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
        Contract rotation
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/contracts/${item.id}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-[var(--accent)]/40"
            >
              <span className="text-sm text-[var(--foreground)]">{item.title}</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {item.channel} · {item.difficulty}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
