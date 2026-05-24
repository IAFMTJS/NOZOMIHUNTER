import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { PreparationScoreBar } from "./PreparationScoreBar"
import { VocabTile } from "@/components/ui/screen/VocabTile"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"

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
    <div className="nozomi-screen-prep relative space-y-6">
      <HeroBanner title={questTitle} tall className="opacity-90" />

      <header className="relative space-y-3">
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
        <div className="grid grid-cols-2 gap-3">
          {vocabulary.map((word, index) => (
            <VocabTile
              key={`${word.kanji}-${word.romaji}-${index}`}
              kanji={word.kanji}
              reading={word.reading}
              romaji={word.romaji}
              meaning={word.meaning}
              threatLevel={word.threatLevel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
