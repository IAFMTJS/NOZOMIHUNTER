"use client"

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
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
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
