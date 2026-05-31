"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { ArcadeCard } from "@/components/ui/cards/ArcadeCard"
import { GAME_MODE_REGISTRY, isGameModeUnlocked, TRAINING_GAME_MODES } from "@/config/gameModeRegistry"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"
import { trainingDisciplineSkin } from "@/systems/presentation/trainingDisciplinePresentation"
import { pickDailyTrainingPriority } from "@/systems/training/trainingPrioritySystem"
import { DISCIPLINE_REWARDS } from "@/systems/progression/disciplineCurrencySystem"
import { GameAssetImage } from "@/components/ui/GameAssetImage"
import { TrainingDrillView } from "@/features/training/components/TrainingDrillView"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

export function TrainingClient() {
  const router = useRouter()
  const {
    user,
    player,
    activeQuests,
    hubView,
    hubFocusQuestId,
    hunterPresentation,
    quest,
    setHubView,
    setHubFocusQuestId,
  } = useHunterSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateUtc = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const activeDrill = useMemo(() => {
    if (hubView !== "hunt" || !hubFocusQuestId) return null
    const match = activeQuests.find((q) => q.id === hubFocusQuestId)
    return match && isTrainingQuest(match) ? match : null
  }, [hubView, hubFocusQuestId, activeQuests])

  async function deploy(mode: GameModeId) {
    if (!user?.id || !player) return
    setBusy(true)
    setError(null)
    try {
      router.push(`/prepare?trainingMode=${encodeURIComponent(mode)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training deployment failed.")
    } finally {
      setBusy(false)
    }
  }

  function exitDrill() {
    setHubView("menu")
    setHubFocusQuestId(null)
  }

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading training channel…</p>
      </HunterPage>
    )
  }

  if (activeDrill) {
    return (
      <TrainingDrillView
        quest={activeDrill}
        player={player}
        encounterClassName={hunterPresentation.encounterClass}
        busy={quest.busy}
        onBack={exitDrill}
        onProgress={quest.progress}
        onComplete={quest.complete}
        onSubmitAnswer={quest.submitAnswer}
        onGameModeAction={quest.submitGameModeAction}
        onAbandon={quest.abandon}
        onDismissPreparation={quest.dismissPreparation}
      />
    )
  }

  const priorityId = pickDailyTrainingPriority(player, dateUtc)
  const priorityDef = GAME_MODE_REGISTRY[priorityId]
  const otherModes = TRAINING_GAME_MODES.filter((id) => id !== priorityId)

  return (
    <HunterPage className="nozomi-screen-training space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Arcade channel
        </p>
        <h1 className="font-display text-xl text-[var(--foreground)]">
          Stabilization drills
        </h1>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-[var(--reward)]/35 bg-[var(--overlay-subtle)] p-5">
        <div className="nozomi-hero-art-slot absolute inset-0 opacity-30">
          <GameAssetImage assetKey="hero.training.priority" alt="" fill />
        </div>
        <div className="relative z-[1]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--reward)]">
          Today&apos;s priority
        </p>
        <p className="mt-1 font-display text-xl text-[var(--foreground)]">
          {priorityDef.label}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">{trainingBlurb(priorityId)}</p>
        <p className="mt-2 text-xs text-[var(--accent-bright)]">
          +{DISCIPLINE_REWARDS.TRAINING_COMPLETE} discipline on clear · RECOMMENDED
        </p>
        <Button
          className="mt-4 w-full"
          variant="cta"
          disabled={busy || !isGameModeUnlocked(priorityId, player)}
          data-testid={E2E_TEST_IDS.trainingPlay(priorityId)}
          onClick={() => void deploy(priorityId)}
        >
          Play
        </Button>
        </div>
      </section>

      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Other drills</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {otherModes.map((modeId) => {
          const def = GAME_MODE_REGISTRY[modeId]
          const unlocked = isGameModeUnlocked(modeId, player)
          const discipline = trainingDisciplineSkin(modeId)
          return (
            <ArcadeCard
              key={modeId}
              accent={def.emotion === "DOPAMINE" ? "gold" : "purple"}
              className={discipline.panelClass}
            >
              <p className="font-display text-lg text-[var(--foreground)]">{def.label}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">{trainingBlurb(modeId)}</p>
              <Button
                className="mt-4 w-full"
                variant="subtle"
                disabled={busy || !unlocked}
                data-testid={E2E_TEST_IDS.trainingPlay(modeId)}
                onClick={() => void deploy(modeId)}
              >
                {unlocked ? "Play" : `Requires L${def.minLevel}`}
              </Button>
            </ArcadeCard>
          )
        })}
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </HunterPage>
  )
}

function trainingBlurb(mode: GameModeId): string {
  switch (mode) {
    case "SIGNAL_CALIBRATION":
      return "Directional audio training."
    case "KANJI_SURGERY":
      return "Seal reconstruction under corruption pressure."
    case "MEMORY_CASCADE":
      return "Information chaining recall."
    case "SHADOW_ECHO":
      return "Mirror operator pacing."
    case "KANA_DASH":
      return "Rapid kana recognition with combo chains."
    case "ECHO_LISTENING":
      return "One playback — rebuild the phrase."
    case "SHADOW_TYPING":
      return "Type before the glyph collapses."
    case "MEMORY_GRID":
      return "Lock matching pairs under pressure."
    case "SURVIVAL_VOCAB":
      return "Endless waves until you break."
    default:
      return "Training simulation."
  }
}
