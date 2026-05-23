import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"

export type HubView = "menu" | "hunt" | "contracts" | "sector"

export interface ContractHubProps {
  player: PlayerContract
  hunterPortraitClass?: string
  hunterAuraClass?: string
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
  onViewChange?: (view: HubView) => void
}

export interface PenaltyMods {
  maxWrongAttempts: number
  maxListeningReplays: number
  signalDegraded: boolean
}
