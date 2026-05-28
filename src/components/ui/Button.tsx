import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "primary" | "cta" | "ghost" | "danger" | "subtle"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: "sm" | "md"
  children: ReactNode
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--accent)] text-[var(--accent-bright)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)]",
  cta:
    "nozomi-btn-cta border-transparent text-white hover:brightness-110",
  ghost:
    "border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--overlay-muted)] hover:text-[var(--foreground)]",
  danger:
    "border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white",
  subtle:
    "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:underline",
}

const SIZE_CLASS = {
  sm: "min-h-9 px-3 py-1 text-sm",
  md: "min-h-11 px-4 py-2 text-sm",
} as const

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: "sm" | "md" = "sm",
  className = ""
): string {
  return `inline-flex items-center justify-center rounded border font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`
}

export function Button({
  variant = "primary",
  size = "sm",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  )
}
