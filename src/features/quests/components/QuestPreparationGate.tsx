"use client"

import { useCallback, useState, type ReactNode } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { QuestPreparationBriefing } from "@/components/preparation/QuestPreparationBriefing"
import {
  getPreparationDisplayVocabulary,
  shouldShowPreparationBriefing,
} from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { ScreenCTA } from "@/components/ui/ScreenCTA"

interface QuestPreparationGateProps {
  quest: QuestContract
  children: ReactNode
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
    <div className="flex flex-col gap-8 pb-28">
      <Panel
        as="section"
        tone="accent"
        className="nozomi-screen-prep"
        aria-label="Quest vocabulary preparation"
      >
        <div className="mb-6">
          <StatusChip label="Awaiting deploy" tone="accent" pulse />
        </div>

        <QuestPreparationBriefing
          questTitle={quest.title}
          questType={quest.type}
          preparationScore={prep.preparationScore}
          vocabulary={displayVocabulary}
          allTargetsKnown={allTargetsKnown}
        />
      </Panel>

      <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Encounter locked · complete briefing to continue
      </p>

      <ScreenCTA
        label="Start mission"
        staminaCost={10}
        disabled={disabled}
        onClick={() => void dismiss()}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => void dismiss()}
          className="w-full"
        >
          Skip briefing
        </Button>
      </ScreenCTA>
    </div>
  )
}
