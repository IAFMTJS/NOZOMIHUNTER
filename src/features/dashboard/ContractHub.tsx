"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { MOTION } from "@/config/motionPresets"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { QuestCard } from "@/features/quests/components/QuestCard"
import { DungeonRunner } from "@/features/dungeons/components/DungeonRunner"
import {
  listAllDungeonDefinitions,
  minDungeonLevel,
  resolveDungeonAccess,
} from "@/systems/dungeons/dungeonAccess"
import { DungeonCorridorCard } from "@/components/ui/DungeonCorridorCard"
import {
  hasSignalDegradation,
  listeningReplayLimitForPenalties,
  maxWrongAttemptsForPenalties,
} from "@/systems/penalties/penaltyGameplaySystem"

export type HubView = "menu" | "hunt" | "contracts" | "sector"

interface ContractHubProps {
  player: PlayerContract
  regularQuests: QuestContract[]
  activeDungeon: QuestContract | undefined
  activeQuests: QuestContract[]
  busy: boolean
  error: string | null
  questMessage: string | null
  encounterClassName: string
  dungeonBusy: boolean
  dungeonError: string | null
  dungeonMessage: string | null
  onNewQuest: () => void
  onEnterDungeon: (key: string) => void
  onDungeonDeploy: () => Promise<void>
  onDungeonEnterSector: () => Promise<void>
  onDungeonExtract: () => Promise<void>
  onDungeonSubmitAnswer: (answer: string) => Promise<void>
  onDungeonSubmitListening: (answer: string) => Promise<void>
  onDungeonSendMessage: (message: string) => Promise<void>
  onDungeonSubmitSpeech: (transcript: string, ms: number) => Promise<void>
  onDungeonAbandon: () => Promise<void>
  onProgress: (questId: string) => void
  onComplete: (questId: string) => void
  onSubmitAnswer?: (
    questId: string,
    answer: string
  ) => Promise<{ correct: boolean; encounterFailed: boolean } | null>
  onSendMessage?: (
    questId: string,
    message: string
  ) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onSubmitSpeech?: (
    questId: string,
    transcript: string,
    ms: number
  ) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
    compositeScore: number
  } | null>
  onSubmitListening?: (
    questId: string,
    answer: string
  ) => Promise<{ correct: boolean; encounterFailed: boolean } | null>
  onAbandon: (questId: string) => void | Promise<void>
  onDismissPreparation: (questId: string) => void | Promise<void>
}

function questReadyForHunt(quest: QuestContract): boolean {
  if (hasActivePreparationPhase(quest)) return false
  switch (quest.type) {
    case "VOCABULARY":
      return (quest.vocabularyEncounter?.words.length ?? 0) > 0
    case "CONVERSATION":
      return (quest.conversationEncounter?.messages.length ?? 0) > 0
    case "SPEECH":
      return (quest.speechEncounter?.phrases.length ?? 0) > 0
    case "LISTENING":
      return (quest.listeningEncounter?.fragments.length ?? 0) > 0
    default:
      return false
  }
}

function defaultView(
  activeDungeon: QuestContract | undefined,
  huntQuest: QuestContract | undefined
): HubView {
  if (activeDungeon) return "sector"
  if (huntQuest) return "hunt"
  return "menu"
}

export function ContractHub(props: ContractHubProps) {
  const defaultHunt = props.regularQuests.find(questReadyForHunt)
  const [view, setView] = useState<HubView>(() =>
    defaultView(props.activeDungeon, defaultHunt)
  )
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    defaultHunt?.id ?? null
  )

  const activeHunt =
    view === "hunt"
      ? props.regularQuests.find((q) => q.id === selectedQuestId) ??
        defaultHunt ??
        props.regularQuests[0]
      : undefined

  const contractCount = props.regularQuests.length
  const allDungeons = listAllDungeonDefinitions()
  const sectorOpen =
    props.player.level >= minDungeonLevel() || Boolean(props.activeDungeon)
  const penaltyMods = {
    maxWrongAttempts: maxWrongAttemptsForPenalties(props.player.penalties),
    maxListeningReplays: listeningReplayLimitForPenalties(
      props.player.penalties
    ),
    signalDegraded: hasSignalDegradation(props.player.penalties),
  }

  const menuCards = useMemo(
    () => [
      {
        id: "hunt" as const,
        title: "Active hunt",
        desc:
          defaultHunt != null
            ? `Resume ${defaultHunt.title}`
            : "No live contract — dispatch one first.",
        disabled: !defaultHunt,
        badge: defaultHunt?.type ?? "idle",
      },
      {
        id: "contracts" as const,
        title: "Contract dispatch",
        desc: `${contractCount} active · request new work from the grid.`,
        disabled: false,
        badge: String(contractCount),
      },
      {
        id: "sector" as const,
        title: "Dungeon sector",
        desc: props.activeDungeon
          ? "Run in progress — re-enter the corridor."
          : sectorOpen
            ? "Enter a ranked corridor when ready."
            : "Unlock corridors by leveling up.",
        disabled: !sectorOpen,
        badge: props.activeDungeon ? "live" : "locked",
      },
    ],
    [defaultHunt, contractCount, sectorOpen, props.activeDungeon]
  )

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={MOTION.panel}
            className="grid gap-3 sm:grid-cols-1"
          >
            <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Command node — select operation
            </p>
            {menuCards.map((card) => (
              <button
                key={card.id}
                type="button"
                disabled={card.disabled}
                onClick={() => setView(card.id)}
                className="group text-left disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Panel
                  tone={card.disabled ? "inset" : "accent"}
                  className="transition-transform duration-200 group-hover:scale-[1.01] group-disabled:hover:scale-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">{card.desc}</p>
                    </div>
                    <StatusChip
                      label={card.badge}
                      tone={card.disabled ? "neutral" : "accent"}
                    />
                  </div>
                </Panel>
              </button>
            ))}
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
            <HubBack onBack={() => setView("menu")} label="Command node" />
            {activeHunt ? (
              <QuestCard
                quest={activeHunt}
                disabled={props.busy}
                encounterClassName={props.encounterClassName}
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
            ) : (
              <Panel tone="inset">
                <p className="text-sm text-[var(--muted)]">
                  No active hunt. Open contract dispatch to request work.
                </p>
                <Button
                  size="md"
                  className="mt-4"
                  onClick={() => setView("contracts")}
                >
                  Go to dispatch
                </Button>
              </Panel>
            )}
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <HubBack onBack={() => setView("menu")} label="Command node" />
              <Button
                disabled={props.busy}
                size="md"
                onClick={props.onNewQuest}
                className="w-full sm:w-auto"
              >
                Request contract
              </Button>
            </div>

            {props.error && (
              <p className="mb-4 text-sm text-[var(--danger)]">{props.error}</p>
            )}
            {props.questMessage && (
              <p className="mb-4 text-sm text-[var(--muted)]">{props.questMessage}</p>
            )}

            {props.regularQuests.length === 0 ? (
              <Panel tone="inset">
                <p className="text-sm text-[var(--muted)]">
                  Grid empty. Request a contract to begin the hunt loop.
                </p>
              </Panel>
            ) : (
              <ul className="flex flex-col gap-3">
                {props.regularQuests.map((quest) => (
                  <li key={quest.id}>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        setSelectedQuestId(quest.id)
                        setView("hunt")
                      }}
                    >
                      <Panel
                        tone="default"
                        className="transition-colors hover:border-[var(--border-accent)]"
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
                            Tap to enter hunt mode →
                          </p>
                        )}
                      </Panel>
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
            <HubBack onBack={() => setView("menu")} label="Command node" />

            {!props.activeDungeon && (
              <div className="mb-4 grid gap-3">
                {allDungeons.map((def) => {
                  const access = resolveDungeonAccess(
                    props.player,
                    props.activeQuests,
                    def.key
                  )
                  return (
                    <DungeonCorridorCard
                      key={def.key}
                      definition={def}
                      access={access}
                      disabled={props.dungeonBusy}
                      onEnter={props.onEnterDungeon}
                    />
                  )
                })}
              </div>
            )}

            {props.dungeonError && (
              <p className="mb-4 text-sm text-[var(--danger)]">{props.dungeonError}</p>
            )}
            {props.dungeonMessage && (
              <p className="mb-4 text-sm text-[var(--muted)]">{props.dungeonMessage}</p>
            )}

            {props.activeDungeon ? (
              <DungeonRunner
                quest={props.activeDungeon}
                disabled={props.dungeonBusy}
                encounterClassName={props.encounterClassName}
                maxWrongAttempts={penaltyMods.maxWrongAttempts}
                maxListeningReplays={penaltyMods.maxListeningReplays}
                signalDegraded={penaltyMods.signalDegraded}
                onDeploy={props.onDungeonDeploy}
                onEnterSector={props.onDungeonEnterSector}
                onExtract={props.onDungeonExtract}
                onSubmitAnswer={props.onDungeonSubmitAnswer}
                onSubmitListening={props.onDungeonSubmitListening}
                onSendMessage={props.onDungeonSendMessage}
                onSubmitSpeech={props.onDungeonSubmitSpeech}
                onAbandon={props.onDungeonAbandon}
              />
            ) : (
              <Panel tone="inset">
                <p className="text-sm text-[var(--muted)]">
                  No dungeon run active. Select a corridor above when unlocked.
                </p>
              </Panel>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HubBack({
  onBack,
  label,
}: {
  onBack: () => void
  label: string
}) {
  return (
    <Button variant="ghost" size="sm" className="mb-4" onClick={onBack}>
      ← {label}
    </Button>
  )
}
