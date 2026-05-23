import Link from "next/link"

interface HunterPageBackProps {
  href: string
  label?: string
}

export function HunterPageBack({ href, label = "Back" }: HunterPageBackProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-sm text-[var(--accent-bright)] hover:underline"
    >
      ← {label}
    </Link>
  )
}
