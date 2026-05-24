import Link from "next/link"

interface HunterPageBackProps {
  href: string
  label?: string
  transitionLine?: string
}

export function HunterPageBack({
  href,
  label = "Back",
  transitionLine,
}: HunterPageBackProps) {
  return (
    <div className="space-y-2">
      <Link
        href={href}
        className="inline-flex min-h-11 items-center text-sm text-[var(--accent-bright)] hover:underline"
      >
        ← {label}
      </Link>
      {transitionLine ? (
        <p className="font-mono text-xs italic text-[var(--muted)]">
          &ldquo;{transitionLine}&rdquo;
        </p>
      ) : null}
    </div>
  )
}
