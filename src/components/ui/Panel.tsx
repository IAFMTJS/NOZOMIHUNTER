import type { HTMLAttributes, ReactNode } from "react"

type PanelTone =
  | "default"
  | "accent"
  | "danger"
  | "inset"
  | "corruption"
  | "boss"
  | "reward"

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "section" | "aside"
  tone?: PanelTone
  children: ReactNode
}

const TONE_CLASS: Record<PanelTone, string> = {
  default: "nozomi-embedded border-transparent",
  accent: "nozomi-embedded-accent border-transparent",
  danger:
    "border-transparent bg-[var(--danger)]/8 shadow-[inset_3px_0_0_var(--danger-a50)]",
  inset: "nozomi-embedded border-transparent opacity-90",
  corruption:
    "border-transparent bg-[var(--corruption)]/10 shadow-[inset_3px_0_0_var(--corruption-a45),0_0_24px_var(--corruption-a10)]",
  boss: "border-transparent bg-[var(--danger)]/8 shadow-[inset_3px_0_0_var(--danger-a55),0_0_28px_var(--danger-a08)]",
  reward:
    "border-transparent bg-[var(--reward)]/8 shadow-[inset_3px_0_0_var(--reward-a45),0_0_24px_var(--glow-reward)]",
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
      className={`nozomi-encounter-panel rounded-[var(--radius-panel)] p-4 transition-[box-shadow,opacity] duration-[var(--duration-feedback)] ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
