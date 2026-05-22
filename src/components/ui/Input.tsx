import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined)

  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={inputId}>
      {label && <span className="text-[var(--muted)]">{label}</span>}
      <input
        id={inputId}
        className={`min-h-11 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]/60 sm:min-h-0 sm:text-sm ${className}`}
        {...props}
      />
    </label>
  )
}
