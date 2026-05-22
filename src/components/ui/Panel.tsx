import type { HTMLAttributes, ReactNode } from "react"

type PanelTone =
  | "default"
  | "accent"
  | "danger"
  | "inset"
  | "corruption"
  | "boss"

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "section" | "aside"
  tone?: PanelTone
  children: ReactNode
}

const TONE_CLASS: Record<PanelTone, string> = {
  default: "border-[var(--border-subtle)] bg-[var(--surface-1)]",
  accent:
    "border-[var(--border-accent)] bg-[var(--accent-dim)] shadow-[0_0_32px_var(--glow-accent)]",
  danger: "border-[var(--danger)]/50 bg-[var(--danger)]/10",
  inset: "border-[var(--border-subtle)] bg-[var(--surface-2)]",
  corruption:
    "border-[var(--corruption)]/45 bg-[var(--corruption)]/10 shadow-[0_0_24px_rgba(154,107,171,0.12)]",
  boss: "border-[var(--danger)]/55 bg-[var(--danger)]/8 shadow-[0_0_32px_rgba(212,106,122,0.1)]",
}

export function Panel({
  as: Tag = "div",
  tone = "default",
  className = "",
  children,
  ...props
}: PanelProps) {
  return (
    <Tag
      className={`nozomi-encounter-panel rounded-[var(--radius-panel)] border p-4 transition-colors duration-[var(--duration-feedback)] ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
