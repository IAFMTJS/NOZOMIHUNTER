"use client"

import { useState, type ReactNode } from "react"

interface CollapsibleSectionProps {
  title: string
  count?: number
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between font-display text-xs uppercase tracking-widest text-[var(--muted)]"
      >
        <span>
          {title}
          {count != null && (
            <span className="ml-2 text-[var(--accent-bright)]">({count})</span>
          )}
        </span>
        <span className="text-[var(--accent-bright)]">{open ? "−" : "+"}</span>
      </button>
      {open && children}
    </section>
  )
}
