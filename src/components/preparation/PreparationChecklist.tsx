import Link from "next/link"
import type { PreparationChecklistContract } from "@/contracts/readiness-contract"

interface PreparationChecklistProps {
  checklist: PreparationChecklistContract
}

const ROWS: {
  key: keyof PreparationChecklistContract
  label: string
  href: string
  incompleteHint: string
}[] = [
  {
    key: "operationalReadiness",
    label: "Operational readiness",
    href: "#readiness-breakdown",
    incompleteHint: "Below minimum deploy threshold — see breakdown.",
  },
  {
    key: "equipment",
    label: "Equipment check",
    href: "/inventory",
    incompleteHint: "Equip loadout gear from inventory.",
  },
  {
    key: "skillLoadout",
    label: "Skill loadout",
    href: "/profile#operator-metrics",
    incompleteHint: "Allocate skills or finish operator tutorial.",
  },
  {
    key: "consumables",
    label: "Consumables",
    href: "/inventory",
    incompleteHint: "Stock recovery items before deploy.",
  },
  {
    key: "vocabulary",
    label: "Vocabulary",
    href: "/vocabulary",
    incompleteHint: "Review unknown contract targets in threat intel.",
  },
]

export function PreparationChecklist({ checklist }: PreparationChecklistProps) {
  return (
    <ul className="space-y-2" aria-label="Deployment checklist">
      {ROWS.map((row) => {
        const done = checklist[row.key]
        return (
          <li key={row.key}>
            <Link
              href={row.href}
              className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm transition-colors hover:border-[var(--accent)]/40 ${
                done
                  ? "border-[var(--border-subtle)] bg-[var(--overlay-faint)]"
                  : "border-[var(--danger)]/35 bg-[var(--danger)]/5"
              }`}
            >
              <span className="flex items-center justify-between">
                <span className={done ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}>
                  {row.label}
                </span>
                <span className={done ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {done ? "✓" : "—"}
                </span>
              </span>
              {!done && (
                <span className="text-xs text-[var(--muted)]">{row.incompleteHint}</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
