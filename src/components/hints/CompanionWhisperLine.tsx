import type { CompanionWhisperContract } from "@/contracts/hint-contract"

interface CompanionWhisperLineProps {
  whisper: CompanionWhisperContract | null
}

export function CompanionWhisperLine({ whisper }: CompanionWhisperLineProps) {
  if (!whisper) return null

  return (
    <p
      className="nozomi-hint-whisper rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-3 py-2 text-xs italic leading-relaxed text-[var(--accent-bright)]"
      role="status"
      aria-live="polite"
    >
      {whisper.line}
    </p>
  )
}
