export interface ComprehensionChoice {
  id: string
  label: string
}

interface ComprehensionChoiceListProps {
  choices: ComprehensionChoice[]
  selectedId: string | null
  disabled?: boolean
  onSelect: (id: string) => void
}

export function ComprehensionChoiceList({
  choices,
  selectedId,
  disabled,
  onSelect,
}: ComprehensionChoiceListProps) {
  return (
    <ul className="space-y-2">
      {choices.map((choice, i) => {
        const selected = choice.id === selectedId
        const letter = String.fromCharCode(65 + i)
        return (
          <li key={choice.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(choice.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--foreground)] shadow-[0_0_16px_var(--glow-accent)]"
                  : "border-[var(--border-subtle)] bg-black/25 text-[var(--muted)] hover:border-[var(--accent)]/30"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold ${
                  selected
                    ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                    : "bg-black/40"
                }`}
              >
                {letter}
              </span>
              <span>{choice.label}</span>
              {selected && (
                <span className="ml-auto text-[var(--success)]" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
