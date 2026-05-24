"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { QuestFileDetail } from "@/features/contracts/components/QuestFileDetail"
import { Button } from "@/components/ui/Button"
import {
  isQuestEncounterPlayable,
  MISSION_DATA_CORRUPTED_COPY,
} from "@/systems/quests/questPlayabilitySystem"
import type { QuestRequestChannel } from "@/contracts/quest-contract"

interface ContractDetailClientProps {
  questId: string
}

function parseChannel(tab: string | null): QuestRequestChannel {
  if (tab === "daily" || tab === "side" || tab === "story") return tab
  return "side"
}

export function ContractDetailClient({ questId }: ContractDetailClientProps) {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const channel = parseChannel(tab)
  const backHref = `/contracts?tab=${channel}`
  const { player, regularQuests, activeQuests, trackMission, quest } = useHunterSession()

  const questRecord =
    regularQuests.find((q) => q.id === questId) ??
    activeQuests.find((q) => q.id === questId)

  if (!player || !questRecord) {
    return (
      <HunterPage className="nozomi-screen-contract">
        <HunterPageBack href={backHref} label="Mission log" />
        <p className="text-[var(--muted)]">Contract file not found.</p>
      </HunterPage>
    )
  }

  const corrupted =
    questRecord.type !== "DUNGEON" && !isQuestEncounterPlayable(questRecord)

  if (corrupted) {
    return (
      <HunterPage className="nozomi-screen-contract pb-32">
        <HunterPageBack href={backHref} label="Mission log" />
        <div className="mt-6 space-y-4 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4">
          <p className="text-sm text-[var(--warning)]">{MISSION_DATA_CORRUPTED_COPY}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={backHref}>
              <Button variant="ghost" size="md">
                Back to mission log
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              disabled={quest.busy}
              onClick={() => void quest.newQuest(channel)}
            >
              Request new contract
            </Button>
          </div>
        </div>
      </HunterPage>
    )
  }

  return (
    <HunterPage className="nozomi-screen-contract pb-32">
      <HunterPageBack href={backHref} label="Mission log" />
      <QuestFileDetail
        quest={questRecord}
        player={player}
        onTrack={() => void trackMission(questRecord.id)}
      />
    </HunterPage>
  )
}
