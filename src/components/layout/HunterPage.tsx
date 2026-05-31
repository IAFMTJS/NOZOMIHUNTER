import type { ReactNode } from "react"

interface HunterPageProps {
  children: ReactNode
  className?: string
}

/** Page body only — chrome (header + bottom nav) lives in HunterShellLayout. */
export function HunterPage({ children, className = "" }: HunterPageProps) {
  return <div className={`space-y-3 sm:space-y-5 ${className}`.trim()}>{children}</div>
}
