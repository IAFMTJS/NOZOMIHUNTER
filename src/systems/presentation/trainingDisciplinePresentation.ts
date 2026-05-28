import type { GameModeId } from "@/contracts/game-mode-contract"

export type TrainingDiscipline = "listen" | "read" | "write" | "speak" | "arcade"

const MODE_DISCIPLINE: Partial<Record<GameModeId, TrainingDiscipline>> = {
  ECHO_LISTENING: "listen",
  LOST_TRANSMISSION: "listen",
  SIGNAL_CALIBRATION: "listen",
  SHADOW_TYPING: "write",
  KANJI_SURGERY: "write",
  KANA_DASH: "write",
  SHADOW_ECHO: "speak",
  GHOST_INTERROGATION: "speak",
  DEEP_COVER: "speak",
  PANIC_CHANNEL: "speak",
  MEMORY_GRID: "read",
  MEMORY_CASCADE: "read",
  SURVIVAL_VOCAB: "read",
}

const DISCIPLINE_SKIN: Record<
  TrainingDiscipline,
  { label: string; atmosphere: string; panelClass: string }
> = {
  listen: {
    label: "Listening discipline",
    atmosphere: "Whispers in darkness — directional audio",
    panelClass: "border-l-2 border-l-[var(--accent)]",
  },
  read: {
    label: "Reading discipline",
    atmosphere: "Hidden notes — decaying archives",
    panelClass: "border-l-2 border-l-[var(--success)]",
  },
  write: {
    label: "Writing discipline",
    atmosphere: "Ritual reconstruction — symbol tracing",
    panelClass: "border-l-2 border-l-[var(--warning)]",
  },
  speak: {
    label: "Speaking discipline",
    atmosphere: "Voice trials — negotiation under pressure",
    panelClass: "border-l-2 border-l-[var(--danger)]",
  },
  arcade: {
    label: "Arcade stabilization",
    atmosphere: "General drill — mixed signal",
    panelClass: "",
  },
}

export function trainingDisciplineForMode(mode: GameModeId) {
  return MODE_DISCIPLINE[mode] ?? "arcade"
}

export function trainingDisciplineSkin(mode: GameModeId) {
  return DISCIPLINE_SKIN[trainingDisciplineForMode(mode)]
}
