import Link from "next/link"

export interface BreadcrumbSegment {
  label: string
  href?: string
}

interface MissionBreadcrumbProps {
  segments: BreadcrumbSegment[]
}

export function MissionBreadcrumb({ segments }: MissionBreadcrumbProps) {
  return (
    <nav
      aria-label="Mission path"
      className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
    >
      {segments.map((seg, i) => (
        <span key={`${seg.label}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && <span className="opacity-40">›</span>}
          {seg.href ? (
            <Link
              href={seg.href}
              className="transition-colors hover:text-[var(--accent-bright)]"
            >
              {seg.label}
            </Link>
          ) : (
            <span className="text-[var(--accent-bright)]">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
