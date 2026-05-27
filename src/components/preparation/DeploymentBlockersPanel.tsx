import Link from "next/link"
import type { DeployBlockerContract } from "@/contracts/readiness-contract"

interface DeploymentBlockersPanelProps {
  blockers: DeployBlockerContract[]
}

export function DeploymentBlockersPanel({ blockers }: DeploymentBlockersPanelProps) {
  if (blockers.length === 0) return null

  return (
    <section
      className="space-y-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/5 px-4 py-3"
      aria-label="Deployment blockers"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--danger)]">
        Deployment locked
      </p>
      <ul className="space-y-3">
        {blockers.map((blocker) => (
          <li key={blocker.id} className="space-y-1">
            <p className="text-sm font-medium text-[var(--foreground)]">{blocker.title}</p>
            <p className="text-xs leading-relaxed text-[var(--muted)]">{blocker.detail}</p>
            {blocker.recoveryHref && blocker.recoveryLabel && (
              <Link
                href={blocker.recoveryHref}
                className="inline-block text-xs text-[var(--accent-bright)] hover:underline"
              >
                → {blocker.recoveryLabel}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
