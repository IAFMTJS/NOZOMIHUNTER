import Link from "next/link"
import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"
import { PreparationScoreBar } from "./PreparationScoreBar"
import { VocabTile } from "@/components/ui/screen/VocabTile"

interface MissionVocabularyIntelProps {
  preparationScore: number
  displayVocabulary: VocabularyExplanationContract[]
  missingVocabulary: VocabularyExplanationContract[]
  missionType: string
}

export function MissionVocabularyIntel({
  preparationScore,
  displayVocabulary,
  missingVocabulary,
  missionType,
}: MissionVocabularyIntelProps) {
  const minScore = VOCABULARY_PREPARATION_CONFIG.DEPLOY_MIN_PREPARATION_SCORE
  const missingCount = missingVocabulary.length
  const vocabReady = preparationScore >= minScore && missingCount === 0

  return (
    <section
      className="nozomi-embedded space-y-4 rounded-xl px-4 py-3"
      aria-label="Mission vocabulary intelligence"
    >
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent-bright)]">
          Threat intel · {missionType}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {vocabReady
            ? "All contract targets synchronized. Review before deploy if you want a refresher."
            : missingCount > 0
              ? `${missingCount} unknown target${missingCount === 1 ? "" : "s"} blocking full readiness. Study below, then reinforce in the threat index.`
              : `Familiarity below deploy threshold (${minScore}%). Review contract targets.`}
        </p>
        <PreparationScoreBar
          score={preparationScore}
          label="Vocabulary familiarity"
        />
        <p className="text-xs text-[var(--muted)]">
          Deploy requires {minScore}% familiarity
          {missingCount > 0 ? ` · ${missingCount} term${missingCount === 1 ? "" : "s"} still unknown` : ""}
          {" · "}
          <Link href="/vocabulary" className="text-[var(--accent-bright)] hover:underline">
            Threat index
          </Link>
          {" · "}
          <Link href="/training" className="text-[var(--accent-bright)] hover:underline">
            Training drills
          </Link>
        </p>
      </header>

      {displayVocabulary.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {displayVocabulary.map((word, index) => (
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
      ) : (
        <p className="text-sm text-[var(--muted)]">No vocabulary targets on file for this contract.</p>
      )}
    </section>
  )
}
