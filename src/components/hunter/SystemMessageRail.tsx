interface SystemMessageRailProps {
  message: string
  subline?: string
  tone?: "observation" | "warning"
}

export function SystemMessageRail({
  message,
  subline,
  tone = "observation",
}: SystemMessageRailProps) {
  const messageClass =
    tone === "warning" ? "text-[var(--warning)]" : "text-[var(--foreground)]"

  return (
    <div className="nozomi-embedded rounded-[var(--radius-panel)] px-4 py-3 font-mono text-sm">
      <p className={messageClass}>{message}</p>
      {subline ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{subline}</p>
      ) : null}
    </div>
  )
}
