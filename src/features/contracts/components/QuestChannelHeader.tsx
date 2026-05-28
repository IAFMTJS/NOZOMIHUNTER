interface QuestChannelHeaderProps {
  channelKicker?: string
  systemLine?: string | null
  fallbackLine?: string
}

export function QuestChannelHeader({
  channelKicker = "Mission Log",
  systemLine,
  fallbackLine = "The system has indexed your active contract files.",
}: QuestChannelHeaderProps) {
  return (
    <header className="nozomi-embedded rounded-2xl px-4 py-4">
      <p className="font-display text-xs uppercase tracking-[0.32em] text-[var(--accent-bright)]">
        {channelKicker}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {systemLine ?? fallbackLine}
      </p>
    </header>
  )
}
