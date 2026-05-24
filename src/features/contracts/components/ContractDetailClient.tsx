"use client"

import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { QuestFileDetail } from "@/features/contracts/components/QuestFileDetail"

interface ContractDetailClientProps {
  questId: string
}

export function ContractDetailClient({ questId }: ContractDetailClientProps) {
  const { player, regularQuests, activeQuests, trackMission } = useHunterSession()

  const quest =
    regularQuests.find((q) => q.id === questId) ??
    activeQuests.find((q) => q.id === questId)

  if (!player || !quest) {
    return (
      <HunterPage className="nozomi-screen-contract">
        <HunterPageBack href="/contracts?tab=story" label="Mission log" />
        <p className="text-[var(--muted)]">Contract file not found.</p>
      </HunterPage>
    )
  }

  return (
    <HunterPage className="nozomi-screen-contract pb-32">
      <HunterPageBack href="/contracts?tab=story" label="Mission log" />
      <QuestFileDetail
        quest={quest}
        player={player}
        onTrack={() => void trackMission(quest.id)}
      />
    </HunterPage>
  )
}
