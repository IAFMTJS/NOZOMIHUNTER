"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface KanaDashEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  flashClassName?: string
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function KanaDashEncounter({
  quest,
  player,
  disabled,
  flashClassName,
  onSubmit,
  onAbandon,
}: KanaDashEncounterProps) {
  return (
    <ModeEncounterShell modeLabel="Kana Dash" emotion="Dopamine" quest={quest}>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Rapid-fire kana lock — chain correct answers for XP multiplier.
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
