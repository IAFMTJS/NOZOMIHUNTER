"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { HubScreenFrame } from "@/components/layout/HubScreenFrame"
import { HubBack } from "./HubBack"
import { questReadyForHunt } from "./questReadyForHunt"

interface HubDispatchViewProps {
  regularQuests: QuestContract[]
  busy: boolean
  error: string | null
  questMessage: string | null
  onBack: () => void
  onNewQuest: () => void
  onSelectQuest: (questId: string) => void
}

export function HubDispatchView({
  regularQuests,
  busy,
  error,
  questMessage,
  onBack,
  onNewQuest,
  onSelectQuest,
}: HubDispatchViewProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <HubBack onBack={onBack} label="Hunter status" operationCode="OP-DISPATCH" />
        <Button
          disabled={busy}
          size="md"
          onClick={onNewQuest}
          className="w-full sm:w-auto"
        >
          Request contract
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}
      {questMessage && (
        <p className="mb-4 text-sm text-[var(--muted)]">{questMessage}</p>
      )}

      <HubScreenFrame
        variant="dispatch"
        title="Contract dispatch"
        subtitle="Request new contracts. Select an active file to resume the hunt channel."
      >
        {regularQuests.length === 0 ? (
          <Panel tone="inset">
            <p className="text-sm text-[var(--muted)]">
              Dispatch queue empty. Request a contract to begin operations.
            </p>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-3">
            {regularQuests.map((quest) => (
              <li key={quest.id}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelectQuest(quest.id)}
                >
                  <Panel
                    tone="default"
                    className="transition-[box-shadow] duration-200 hover:shadow-[inset_3px_0_0_rgba(122,92,255,0.35)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-semibold text-[var(--foreground)]">
                        {quest.title}
                      </span>
                      <StatusChip label={quest.type} tone="neutral" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                      {quest.description}
                    </p>
                    {questReadyForHunt(quest) && (
                      <p className="mt-2 text-xs text-[var(--accent)]">
                        Open hunt channel →
                      </p>
                    )}
                  </Panel>
                </button>
              </li>
            ))}
          </ul>
        )}
      </HubScreenFrame>
    </>
  )
}
