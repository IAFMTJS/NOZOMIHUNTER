interface QuestChannelHeaderProps {
  systemLine?: string | null
}

export function QuestChannelHeader({ systemLine }: QuestChannelHeaderProps) {
  return (
    <header className="nozomi-embedded rounded-2xl px-4 py-4">
      <p className="font-display text-xs uppercase tracking-[0.32em] text-[var(--accent-bright)]">
        Mission Log
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {systemLine ?? "The system has indexed your active contract files."}
      </p>
    </header>
  )
}
