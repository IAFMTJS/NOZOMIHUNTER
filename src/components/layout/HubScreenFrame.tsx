import type { ReactNode } from "react"

type HubScreenVariant = "ops" | "hunt" | "dispatch" | "sector"

const VARIANT_CLASS: Record<HubScreenVariant, string> = {
  ops: "",
  hunt: "nozomi-screen-hunt",
  dispatch: "nozomi-screen-dispatch",
  sector: "nozomi-screen-sector",
}

interface HubScreenFrameProps {
  variant: HubScreenVariant
  title: string
  subtitle?: string
  children: ReactNode
}

export function HubScreenFrame({
  variant,
  title,
  subtitle,
  children,
}: HubScreenFrameProps) {
  return (
    <div className={`flex flex-col gap-4 sm:gap-6 ${VARIANT_CLASS[variant]}`}>
      <header className="space-y-1">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          {title}
        </p>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </div>
  )
}
