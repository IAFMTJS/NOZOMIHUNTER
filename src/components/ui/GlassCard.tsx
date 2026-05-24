import type { HTMLAttributes, ReactNode } from "react"

type GlassCardTone = "default" | "accent" | "reward" | "locked"

interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "section" | "li"
  tone?: GlassCardTone
  children: ReactNode
}

const TONE_CLASS: Record<GlassCardTone, string> = {
  default: "nozomi-glass-card",
  accent: "nozomi-glass-card nozomi-glass-card-accent",
  reward: "nozomi-glass-card nozomi-glass-card-reward",
  locked: "nozomi-glass-card nozomi-glass-card-locked opacity-60",
}

export function GlassCard({
  as: Tag = "div",
  tone = "default",
  className = "",
  children,
  ...props
}: GlassCardProps) {
  return (
    <Tag
      className={`rounded-xl p-4 ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
