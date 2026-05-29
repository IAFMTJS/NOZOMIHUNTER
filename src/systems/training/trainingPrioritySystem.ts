import { TRAINING_GAME_MODES, GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import type { GameModeId } from "@/contracts/game-mode-contract"
import type { PlayerContract } from "@/contracts/player-contract"

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickDailyTrainingPriority(
  player: PlayerContract,
  dateUtc: string
): GameModeId {
  const unlocked = TRAINING_GAME_MODES.filter((id) => {
    const def = GAME_MODE_REGISTRY[id]
    return player.level >= def.minLevel
  })
  const pool = unlocked.length > 0 ? unlocked : TRAINING_GAME_MODES
  const statPairs: [string, number][] = [
    ["vocabulary", player.stats.vocabulary],
    ["listening", player.stats.listening],
    ["speaking", player.stats.speaking],
    ["grammar", player.stats.grammar],
  ]
  const weakestStat = [...statPairs].sort((a, b) => a[1] - b[1])[0]?.[0]

  const statBias: Partial<Record<GameModeId, number>> = {
    SIGNAL_CALIBRATION: weakestStat === "listening" ? 3 : 0,
    ECHO_LISTENING: weakestStat === "listening" ? 2 : 0,
    KANA_DASH: weakestStat === "vocabulary" ? 2 : 0,
    KANJI_SURGERY: weakestStat === "grammar" ? 2 : 0,
    MEMORY_GRID: weakestStat === "vocabulary" ? 1 : 0,
  }

  const seed = hashSeed(`${player.id}:${dateUtc}`)
  let best = pool[0]!
  let bestScore = -1
  for (const id of pool) {
    const bias = statBias[id] ?? 0
    const score = (hashSeed(`${seed}:${id}`) % 100) + bias * 15
    if (score > bestScore) {
      bestScore = score
      best = id
    }
  }
  return best
}
