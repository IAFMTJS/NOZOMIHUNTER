import type { ReactNode } from "react"

interface StatGridItem {
  label: string
  value: string
  icon?: ReactNode
}

interface StatGridProps {
  items: StatGridItem[]
  columns?: 2 | 4
}

export function StatGrid({ items, columns = 2 }: StatGridProps) {
  const colClass = columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"

  return (
    <div className={`grid gap-2 ${colClass}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="nozomi-glass-card rounded-lg px-3 py-2.5"
        >
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {item.label}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            {item.icon}
            <p className="font-display text-sm font-semibold text-[var(--foreground)]">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
