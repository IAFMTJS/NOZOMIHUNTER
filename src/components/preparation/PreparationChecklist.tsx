import Link from "next/link"
import type { PreparationChecklistContract } from "@/contracts/readiness-contract"

interface PreparationChecklistProps {
  checklist: PreparationChecklistContract
}

const ROWS: {
  key: keyof PreparationChecklistContract
  label: string
  href: string
}[] = [
  { key: "equipment", label: "Equipment check", href: "/inventory" },
  { key: "skillLoadout", label: "Skill loadout", href: "/profile#operator-metrics" },
  { key: "consumables", label: "Consumables", href: "/inventory" },
  { key: "vocabulary", label: "Vocabulary", href: "/vocabulary" },
]

export function PreparationChecklist({ checklist }: PreparationChecklistProps) {
  return (
    <ul className="space-y-2">
      {ROWS.map((row) => {
        const done = checklist[row.key]
        return (
          <li key={row.key}>
            <Link
              href={row.href}
              className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-sm transition-colors hover:border-[var(--accent)]/40"
            >
              <span className={done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                {row.label}
              </span>
              <span
                className={
                  done
                    ? "text-[var(--success)]"
                    : "text-[var(--muted)]"
                }
              >
                {done ? "✓" : "—"}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
