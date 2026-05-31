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
    hubFocusQuestId,
    setHubFocusQuestId,
  } = useHunterSession()

  useEffect(() => {
    if (!isEncounterOverlayRoute(pathname)) {
      setHubView("menu")
      setHubFocusQuestId(null)
    }
  }, [pathname, setHubView, setHubFocusQuestId])

  if (!player) return null
  if (!isEncounterOverlayRoute(pathname)) return null
  if (hubView !== "hunt" && hubView !== "sector") return null

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-[var(--background)] pt-[env(safe-area-inset-top)]"
      style={{
        paddingBottom:
          "calc(var(--hunter-nav-height) + max(0px, env(safe-area-inset-bottom)))",
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
      <ContractHub
        player={player}
        hunterPortraitClass={hunterPresentation.portraitClass}
        hunterAuraClass={hunterPresentation.identityAuraClass}
        onViewChange={setHubView}
        overlayView={hubView === "hunt" || hubView === "sector" ? hubView : undefined}
        focusQuestId={hubFocusQuestId}
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
        onDungeonChooseRoute={dungeon.chooseRoute}
        onDungeonSelectCombatAction={dungeon.selectCombatAction}
        onDungeonExtractionChoice={dungeon.submitExtractionChoice}
        onDungeonEnterSector={dungeon.engageSector}
        onDungeonExtract={dungeon.extract}
        onDungeonSubmitAnswer={dungeon.submitAnswer}
        onDungeonSubmitListening={dungeon.submitListening}
        onDungeonListeningReplay={dungeon.listeningReplay}
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
        onGameModeAction={(questId, action, payload) =>
          quest.submitGameModeAction(questId, action, payload)
        }
        onAbandon={quest.abandon}
        onDismissPreparation={quest.dismissPreparation}
      />
      </div>
    </div>
  )
}
