"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import {
  hasSignalDegradation,
  listeningReplayLimitForPenalties,
  maxWrongAttemptsForPenalties,
} from "@/systems/penalties/penaltyGameplaySystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { getNextDungeonForecast } from "@/systems/dungeons/dungeonForecastSystem"
import { selectSystemMessage } from "@/systems/messaging/systemMessagingSystem"
import { buildSectorMap } from "@/systems/dungeons/dungeonSectorMapSystem"
import { HubMenuView } from "./HubMenuView"
import { HubHuntView } from "./HubHuntView"
import { HubDispatchView } from "./HubDispatchView"
import { HubSectorView } from "./HubSectorView"
import { defaultHubView, questReadyForHunt } from "./questReadyForHunt"
import type { ContractHubProps, HubView } from "./hubTypes"

export type { HubView } from "./hubTypes"

export function ContractHub(props: ContractHubProps) {
  const defaultHunt = props.regularQuests.find(questReadyForHunt)
  const [view, setView] = useState<HubView>(() =>
    defaultHubView(props.activeDungeon, defaultHunt)
  )
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    defaultHunt?.id ?? null
  )

  const { onViewChange } = props
  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  const activeHunt =
    view === "hunt"
      ? props.regularQuests.find((q) => q.id === selectedQuestId) ??
        defaultHunt ??
        props.regularQuests[0]
      : undefined

  const penaltyMods = {
    maxWrongAttempts: maxWrongAttemptsForPenalties(props.player.penalties),
    maxListeningReplays: listeningReplayLimitForPenalties(props.player.penalties),
    signalDegraded: hasSignalDegradation(props.player.penalties),
  }

  const today = new Date().toISOString().slice(0, 10)
  const readiness = useMemo(
    () => computeReadiness({ player: props.player }),
    [props.player]
  )
  const forecast = useMemo(
    () => getNextDungeonForecast(props.player, props.activeQuests),
    [props.player, props.activeQuests]
  )
  const sectorMap = useMemo(
    () => buildSectorMap(props.player, props.activeQuests),
    [props.player, props.activeQuests]
  )
  const systemMessage = useMemo(
    () =>
      selectSystemMessage({
        player: props.player,
        activeQuests: props.activeQuests,
        seed: `${props.player.id}:${today}`,
      }),
    [props.player, props.activeQuests, today]
  )

  return (
    <div className="space-y-10">
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={MOTION.panel}
          >
            <HubMenuView
              player={props.player}
              hunterPortraitClass={props.hunterPortraitClass}
              hunterAuraClass={props.hunterAuraClass}
              regularQuests={props.regularQuests}
              activeDungeon={props.activeDungeon}
              readiness={readiness}
              forecast={forecast}
              systemMessage={systemMessage}
              onSelectView={setView}
            />
          </motion.div>
        )}

        {view === "hunt" && (
          <motion.div
            key="hunt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION.panel}
          >
            <HubHuntView
              activeHunt={activeHunt}
              busy={props.busy}
              encounterClassName={props.encounterClassName}
              penaltyMods={penaltyMods}
              onBack={() => setView("menu")}
              onGoDispatch={() => setView("contracts")}
              props={props}
            />
          </motion.div>
        )}

        {view === "contracts" && (
          <motion.div
            key="contracts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION.panel}
          >
            <HubDispatchView
              regularQuests={props.regularQuests}
              busy={props.busy}
              error={props.error}
              questMessage={props.questMessage}
              onBack={() => setView("menu")}
              onNewQuest={props.onNewQuest}
              onSelectQuest={(id) => {
                setSelectedQuestId(id)
                setView("hunt")
              }}
            />
          </motion.div>
        )}

        {view === "sector" && (
          <motion.div
            key="sector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION.panel}
          >
            <HubSectorView
              player={props.player}
              activeQuests={props.activeQuests}
              activeDungeon={props.activeDungeon}
              dungeonBusy={props.dungeonBusy}
              dungeonError={props.dungeonError}
              dungeonMessage={props.dungeonMessage}
              encounterClassName={props.encounterClassName}
              penaltyMods={penaltyMods}
              sectorMap={sectorMap}
              onBack={() => setView("menu")}
              onEnterDungeon={props.onEnterDungeon}
              props={props}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
