import type { QuestContract } from "@/contracts/quest-contract"

export function ContractTypeIcon({ type }: { type: QuestContract["type"] }) {
  const label =
    type === "VOCABULARY"
      ? "V"
      : type === "LISTENING"
        ? "L"
        : type === "SPEECH"
          ? "S"
          : type === "CONVERSATION"
            ? "C"
            : type === "DUNGEON"
              ? "D"
              : "?"

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] font-display text-sm font-bold text-[var(--accent-bright)]"
      aria-hidden
    >
      {label}
    </span>
  )
}
