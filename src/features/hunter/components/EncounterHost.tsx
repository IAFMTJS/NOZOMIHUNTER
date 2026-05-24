"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ContractHub } from "@/features/hub/ContractHub"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { isEncounterOverlayRoute } from "@/features/hunter/encounterRoutes"

export function EncounterHost() {
  const pathname = usePathname()
  const {
    player,
    regularQuests,
    activeQuests,
    activeDungeon,
    hunterPresentation,
    quest,
    dungeon,
    hubView,
    setHubView,
  } = useHunterSession()

  useEffect(() => {
    if (!isEncounterOverlayRoute(pathname)) {
      setHubView("menu")
      return
    }

    if (activeDungeon && pathname === "/dungeons") {
      setHubView("sector")
    }
  }, [activeDungeon, pathname, setHubView])

  if (!player) return null
  if (!isEncounterOverlayRoute(pathname)) return null
  if (hubView !== "hunt" && hubView !== "sector") return null

  return (
    <div className="hunter-overlay-above-nav fixed inset-x-0 top-0 z-[90] overflow-y-auto bg-[var(--background)]">
      <ContractHub
        player={player}
        hunterPortraitClass={hunterPresentation.portraitClass}
        hunterAuraClass={hunterPresentation.identityAuraClass}
        onViewChange={setHubView}
        regularQuests={regularQuests}
        activeQuests={activeQuests}
        activeDungeon={activeDungeon}
        busy={quest.busy}
        error={quest.error}
        questMessage={quest.questMessage}
        encounterClassName={hunterPresentation.encounterClass}
        dungeonBusy={dungeon.busy}
        dungeonError={dungeon.error}
        dungeonMessage={dungeon.message}
        dungeonExplorationLine={dungeon.explorationLine}
        onNewQuest={quest.newQuest}
        onEnterDungeon={dungeon.enter}
        onDungeonDeploy={dungeon.deploy}
        onDungeonAdvanceExploration={dungeon.advanceExploration}
        onDungeonEngageSector={dungeon.engageSector}
        onDungeonContinueReward={dungeon.continueAfterReward}
        onDungeonEnterSector={dungeon.engageSector}
        onDungeonExtract={dungeon.extract}
        onDungeonSubmitAnswer={dungeon.submitAnswer}
        onDungeonSubmitListening={dungeon.submitListening}
        onDungeonSendMessage={dungeon.sendMessage}
        onDungeonSubmitSpeech={dungeon.submitSpeech}
        onDungeonAbandon={dungeon.abandon}
        onProgress={quest.progress}
        onComplete={quest.complete}
        onSubmitAnswer={(questId, answer) => quest.submitAnswer(questId, answer)}
        onSendMessage={(questId, message) => quest.sendMessage(questId, message)}
        onSubmitSpeech={(questId, transcript, ms) =>
          quest.submitSpeech(questId, transcript, ms)
        }
        onSubmitListening={(questId, answer) =>
          quest.submitListening(questId, answer)
        }
        onAbandon={quest.abandon}
        onDismissPreparation={quest.dismissPreparation}
      />
    </div>
  )
}
