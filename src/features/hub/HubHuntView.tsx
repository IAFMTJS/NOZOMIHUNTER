"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { QuestCard } from "@/features/quests/components/QuestCard"
import { HubScreenFrame } from "@/components/layout/HubScreenFrame"
import { HubBack } from "./HubBack"
import { QuestBoostActions } from "@/features/inventory/components/QuestBoostActions"
import type { ContractHubProps, PenaltyMods } from "./hubTypes"

interface HubHuntViewProps {
  activeHunt: QuestContract | undefined
  busy: boolean
  encounterClassName: string
  penaltyMods: PenaltyMods
  onBack: () => void
  onGoDispatch: () => void
  props: ContractHubProps
}

export function HubHuntView({
  activeHunt,
  busy,
  encounterClassName,
  penaltyMods,
  onBack,
  onGoDispatch,
  props,
}: HubHuntViewProps) {
  return (
    <>
      <HubBack onBack={onBack} label="Hunter status" operationCode="OP-HUNT" />
      <HubScreenFrame
        variant="hunt"
        title="Active hunt"
        subtitle="Encounter channel live. Maintain focus — signal errors stack corruption."
      >
        {activeHunt ? (
          <>
            <QuestCard
              quest={activeHunt}
              disabled={busy}
              encounterClassName={encounterClassName}
              maxWrongAttempts={penaltyMods.maxWrongAttempts}
              maxListeningReplays={penaltyMods.maxListeningReplays}
              signalDegraded={penaltyMods.signalDegraded}
              onProgress={() => props.onProgress(activeHunt.id)}
              onComplete={() => props.onComplete(activeHunt.id)}
              onSubmitAnswer={
                props.onSubmitAnswer
                  ? (a) => props.onSubmitAnswer!(activeHunt.id, a)
                  : undefined
              }
              onSendMessage={
                props.onSendMessage
                  ? (m) => props.onSendMessage!(activeHunt.id, m)
                  : undefined
              }
              onSubmitSpeech={
                props.onSubmitSpeech
                  ? (t, ms) => props.onSubmitSpeech!(activeHunt.id, t, ms)
                  : undefined
              }
              onSubmitListening={
                props.onSubmitListening
                  ? (a) => props.onSubmitListening!(activeHunt.id, a)
                  : undefined
              }
              onAbandon={() => Promise.resolve(props.onAbandon(activeHunt.id))}
              onDismissPreparation={(id) =>
                Promise.resolve(props.onDismissPreparation(id))
              }
            />
            <QuestBoostActions
              player={props.player}
              userId={props.player.id}
              quest={activeHunt}
            />
          </>
        ) : (
          <Panel tone="inset">
            <p className="text-sm text-[var(--muted)]">
              No active hunt. Open contract dispatch to request work.
            </p>
            <Button size="md" className="mt-4" onClick={onGoDispatch}>
              Go to dispatch
            </Button>
          </Panel>
        )}
      </HubScreenFrame>
    </>
  )
}
