import type { ReactNode } from "react"

export type AtmosphereVariant = "entry" | "lobby" | "encounter"

interface AtmosphericBackgroundProps {
  children: ReactNode
  className?: string
  variant?: AtmosphereVariant
}

const VARIANT_CLASS: Record<AtmosphereVariant, string> = {
  entry: "nozomi-atmosphere nozomi-vignette nozomi-scanlines",
  lobby:
    "nozomi-atmosphere-lobby nozomi-vignette nozomi-vignette-light nozomi-scanlines-light",
  encounter: "nozomi-encounter-focus nozomi-vignette",
}

/** Layered backdrop: gradient, vignette, optional scanlines. */
export function AtmosphericBackground({
  children,
  className = "",
  variant = "entry",
}: AtmosphericBackgroundProps) {
  return (
    <div
      className={`${VARIANT_CLASS[variant]} relative min-h-screen ${className}`}
    >
      <div className="relative z-10 h-full min-h-0">{children}</div>
    </div>
  )
}
