"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ComboMeter } from "@/components/ceremonies/ComboMeter"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface SurvivalVocabEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  flashClassName?: string
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function SurvivalVocabEncounter({
  quest,
  player,
  disabled,
  flashClassName,
  onSubmit,
  onAbandon,
}: SurvivalVocabEncounterProps) {
  const enc = quest.vocabularyEncounter
  const streak = enc?.correctStreak ?? 0
  const wave = enc?.survivalWave ?? 1

  return (
    <ModeEncounterShell modeLabel="Survival Mode" emotion="Survival" quest={quest}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <ComboMeter streak={streak} />
        <span className="text-[10px] uppercase tracking-widest text-[var(--danger)]">
          Wave {wave}
        </span>
      </div>
      <p className="mb-2 text-xs text-[var(--danger)]">
        One failure ends the run — chain correct answers to push deeper.
      </p>
      <VocabularyEncounter
        quest={quest}
        player={player}
        disabled={disabled}
        hideLegacyBriefing
        flashClassName={flashClassName}
        onSubmit={onSubmit}
        onAbandon={onAbandon}
      />
    </ModeEncounterShell>
  )
}
