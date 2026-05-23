interface SystemMessageRailProps {
  message: string
  subline?: string
}

export function SystemMessageRail({ message, subline }: SystemMessageRailProps) {
  return (
    <div className="nozomi-embedded rounded-[var(--radius-panel)] px-4 py-3 font-mono text-sm">
      <p className="text-[var(--foreground)]">{message}</p>
      {subline ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{subline}</p>
      ) : null}
    </div>
  )
}
