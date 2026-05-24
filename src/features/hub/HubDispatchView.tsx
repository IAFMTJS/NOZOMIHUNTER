"use client"

import Link from "next/link"
import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
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
  const resumable = regularQuests.filter(questReadyForHunt)

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
        title="Active operations"
        subtitle="Resume an in-progress hunt. Browse and request contracts from the mission log."
      >
        <Link
          href="/contracts"
          className="mb-4 block rounded-xl border border-[var(--accent)]/35 bg-[var(--accent-dim)] px-4 py-3 text-center text-sm text-[var(--accent-bright)] transition-opacity hover:opacity-90"
        >
          Open mission log →
        </Link>

        {resumable.length === 0 ? (
          <Panel tone="inset">
            <p className="text-sm text-[var(--muted)]">
              No live hunt channel. Open the mission log to deploy a contract.
            </p>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-3">
            {resumable.map((quest) => (
              <li key={quest.id}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelectQuest(quest.id)}
                >
                  <Panel
                    tone="accent"
                    className="transition-[box-shadow] duration-200 hover:shadow-[0_0_20px_var(--glow-accent)]"
                  >
                    <p className="font-display font-semibold text-[var(--foreground)]">
                      Resume · {quest.title}
                    </p>
                    <p className="mt-2 text-xs text-[var(--accent-bright)]">
                      Open hunt channel →
                    </p>
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
