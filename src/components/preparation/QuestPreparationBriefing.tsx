import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { JapaneseText } from "@/components/JapaneseText"
import { PreparationScoreBar } from "./PreparationScoreBar"

const IMPORTANCE_STYLES: Record<
  VocabularyExplanationContract["importance"],
  string
> = {
  HIGH: "border-[var(--border-accent)] bg-[var(--accent-dim)] shadow-[0_0_24px_var(--glow-accent)]",
  MEDIUM: "border-white/25 bg-white/5",
  LOW: "border-white/10 bg-black/30 opacity-90",
}

interface QuestPreparationBriefingProps {
  questTitle: string
  questType: string
  preparationScore: number
  vocabulary: VocabularyExplanationContract[]
  allTargetsKnown: boolean
}

export function QuestPreparationBriefing({
  questTitle,
  questType,
  preparationScore,
  vocabulary,
  allTargetsKnown,
}: QuestPreparationBriefingProps) {
  return (
    <div className="relative space-y-5">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent)]/10 blur-2xl"
        aria-hidden
      />

      <header className="relative space-y-3 border-b border-white/10 pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          Hunter briefing · {questType}
        </p>
        <h3 className="font-display text-xl font-bold leading-tight text-[var(--foreground)]">
          {questTitle}
        </h3>
        <p className="text-sm text-[var(--muted)]">
          {allTargetsKnown
            ? "Registry match complete. Review targets, then deploy into the contract."
            : "Study critical vocabulary before tension rises — the encounter stays locked until you deploy."}
        </p>
        <PreparationScoreBar score={preparationScore} />
      </header>

      {vocabulary.length === 0 ? (
        <p className="rounded border border-dashed border-white/15 p-4 text-sm text-[var(--muted)]">
          No vocabulary intel attached to this contract. Deploy when ready.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {vocabulary.map((word, index) => (
            <li
              key={`${word.kanji}-${word.romaji}-${index}`}
              className={`rounded-lg border p-4 ${IMPORTANCE_STYLES[word.importance]}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Target {index + 1}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    word.importance === "HIGH"
                      ? "bg-[var(--accent)]/25 text-[var(--accent)]"
                      : "bg-white/10 text-[var(--muted)]"
                  }`}
                >
                  {word.importance}
                </span>
              </div>
              <JapaneseText
                japanese={word.kanji}
                romaji={word.romaji}
                size="md"
              />
              <p className="mt-3 text-sm leading-snug">{word.meaning}</p>
              <p className="mt-2 text-xs italic text-[var(--muted)]">
                {word.context}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
