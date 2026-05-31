"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { Button } from "@/components/ui/Button"
import { QuestCard } from "@/features/quests/components/QuestCard"
import {
  hasSignalDegradation,
  listeningReplayLimitForPenalties,
  maxWrongAttemptsForPenalties,
} from "@/systems/penalties/penaltyGameplaySystem"
import { maxWrongAttemptsWithBoosts } from "@/systems/economy/boostSystem"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"

interface TrainingDrillViewProps {
  quest: QuestContract
  player: PlayerContract
  encounterClassName: string
  busy: boolean
  onBack: () => void
  onProgress: (questId: string) => void
  onComplete: (questId: string) => void
  onSubmitAnswer: (
    questId: string,
    answer: string
  ) => Promise<{
    correct: boolean
    encounterFailed: boolean
    pressureLine?: string | null
  } | null>
  onGameModeAction: (
    questId: string,
    action: string,
    payload?: string
  ) => Promise<{ correct: boolean; encounterFailed: boolean; message?: string } | null>
  onAbandon: (questId: string) => Promise<void>
  onDismissPreparation: (questId: string) => void | Promise<void>
}

/** Inline training encounter — gameplay stays on /training without hub overlay. */
export function TrainingDrillView({
  quest,
  player,
  encounterClassName,
  busy,
  onBack,
  onProgress,
  onComplete,
  onSubmitAnswer,
  onGameModeAction,
  onAbandon,
  onDismissPreparation,
}: TrainingDrillViewProps) {
  const mode = resolveQuestGameMode(quest)
  const label = GAME_MODE_REGISTRY[mode]?.label ?? "Training drill"

  const maxWrongAttempts = maxWrongAttemptsWithBoosts(
    player,
    maxWrongAttemptsForPenalties(player.penalties)
  )
  const maxListeningReplays = listeningReplayLimitForPenalties(player.penalties)
  const signalDegraded = hasSignalDegradation(player.penalties)

  return (
    <div className="nozomi-screen-training space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="subtle" size="sm" onClick={onBack}>
          ← Drills
        </Button>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {label}
        </p>
      </div>

      <QuestCard
        quest={quest}
        player={player}
        disabled={busy}
        encounterClassName={encounterClassName}
        maxWrongAttempts={maxWrongAttempts}
        maxListeningReplays={maxListeningReplays}
        signalDegraded={signalDegraded}
        onProgress={() => onProgress(quest.id)}
        onComplete={() => onComplete(quest.id)}
        onSubmitAnswer={(answer) => onSubmitAnswer(quest.id, answer)}
        onGameModeAction={(action, payload) =>
          onGameModeAction(quest.id, action, payload).then(() => undefined)
        }
        onAbandon={() => Promise.resolve(onAbandon(quest.id))}
        onDismissPreparation={onDismissPreparation}
      />
    </div>
  )
}
