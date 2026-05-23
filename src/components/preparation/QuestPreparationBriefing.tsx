import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { JapaneseText } from "@/components/JapaneseText"
import { PreparationScoreBar } from "./PreparationScoreBar"
import { threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"

const THREAT_CLASS: Record<
  VocabularyExplanationContract["threatLevel"],
  string
> = {
  SECTOR_CRITICAL: "nozomi-embedded-accent ring-1 ring-[var(--danger)]/40",
  CRITICAL: "nozomi-embedded-accent",
  ELEVATED: "nozomi-embedded",
  ROUTINE: "nozomi-embedded opacity-85",
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
    <div className="nozomi-screen-prep relative space-y-8">
      <header className="relative space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--muted)]">
          Mission prep · {questType}
        </p>
        <h3 className="font-display text-2xl font-bold leading-tight text-[var(--foreground)]">
          {questTitle}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {allTargetsKnown
            ? "Threat index synchronized. Review targets before deployment."
            : "Unknown targets flagged. Encounter locked until you deploy."}
        </p>
        <PreparationScoreBar
          score={preparationScore}
          label="Operational readiness"
        />
      </header>

      {vocabulary.length === 0 ? (
        <p className="nozomi-embedded rounded-[var(--radius-panel)] p-4 text-sm text-[var(--muted)]">
          No threat intel on file. Deploy when ready.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {vocabulary.map((word, index) => (
            <li
              key={`${word.kanji}-${word.romaji}-${index}`}
              className={`rounded-[var(--radius-panel)] p-4 ${THREAT_CLASS[word.threatLevel]}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Target {index + 1}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    word.threatLevel === "SECTOR_CRITICAL" ||
                    word.threatLevel === "CRITICAL"
                      ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                      : word.threatLevel === "ELEVATED"
                        ? "bg-[var(--accent)]/20 text-[var(--accent-bright)]"
                        : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {threatDisplayLabel(word.threatLevel)}
                </span>
              </div>
              <JapaneseText
                japanese={word.kanji}
                romaji={word.romaji}
                size="md"
              />
              <p className="mt-3 text-sm leading-snug text-[var(--foreground)]">
                {word.meaning}
              </p>
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
