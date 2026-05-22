"use client"

import { useCallback, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { QuestPreparationBriefing } from "@/components/preparation/QuestPreparationBriefing"
import {
  getPreparationDisplayVocabulary,
  shouldShowPreparationBriefing,
} from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"

interface QuestPreparationGateProps {
  quest: QuestContract
  children: React.ReactNode
  onBriefingDismissed?: (questId: string) => void | Promise<void>
  disabled?: boolean
}

export function QuestPreparationGate({
  quest,
  children,
  onBriefingDismissed,
  disabled,
}: QuestPreparationGateProps) {
  const [dismissedLocally, setDismissedLocally] = useState(false)

  const prep = quest.vocabularyPreparation
  const showBriefing =
    !dismissedLocally &&
    shouldShowPreparationBriefing(quest) &&
    Boolean(prep)

  const dismiss = useCallback(async () => {
    setDismissedLocally(true)
    await onBriefingDismissed?.(quest.id)
  }, [onBriefingDismissed, quest.id])

  if (!showBriefing || !prep) {
    return <>{children}</>
  }

  const displayVocabulary = getPreparationDisplayVocabulary(quest)
  const allTargetsKnown = prep.newVocabulary.length === 0

  return (
    <div className="space-y-4">
      <section
        className="relative overflow-hidden rounded-lg border border-[var(--border-accent)] bg-gradient-to-b from-[var(--accent-dim)] to-[var(--surface-2)] p-4 shadow-[0_0_40px_var(--glow-accent)] sm:p-5"
        role="region"
        aria-label="Quest vocabulary preparation"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,var(--glow-accent)_50%,transparent_60%)]"
          aria-hidden
        />
        <div className="relative mb-4">
          <StatusChip label="Awaiting deploy" tone="accent" pulse />
        </div>

        <QuestPreparationBriefing
          questTitle={quest.title}
          questType={quest.type}
          preparationScore={prep.preparationScore}
          vocabulary={displayVocabulary}
          allTargetsKnown={allTargetsKnown}
        />

        <div className="relative mt-6 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:flex-wrap">
          <Button
            size="md"
            disabled={disabled}
            onClick={() => void dismiss()}
            className="w-full sm:w-auto"
          >
            Deploy to contract
          </Button>
          <Button
            variant="ghost"
            size="md"
            disabled={disabled}
            onClick={() => void dismiss()}
            className="w-full sm:w-auto"
          >
            Skip briefing
          </Button>
        </div>
      </section>

      <p className="text-center text-xs uppercase tracking-wider text-[var(--muted)]">
        Encounter locked · complete briefing to continue
      </p>
    </div>
  )
}
