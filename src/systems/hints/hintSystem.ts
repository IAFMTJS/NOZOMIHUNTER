import type {
  CompanionWhisperContract,
  HintLearningStage,
  HintPolicyInput,
  HintSessionLimitsContract,
  HintWordContextContract,
  HunterVisionRevealContract,
} from "@/contracts/hint-contract"
import type { AssistLevel } from "@/contracts/game-mode-contract"
import type { VisibleLayers } from "@/systems/learning/challengeDisplaySystem"
import { HINT_CONFIG } from "@/config/hintConfig"
import { resolveRadicalNote } from "@/systems/hints/kanjiComponentHintSystem"

export function masteryLearningStage(masteryScore: number): HintLearningStage {
  if (masteryScore < 20) return "EXPOSURE"
  if (masteryScore < 45) return "RECOGNITION"
  if (masteryScore < 70) return "ASSISTED_RECALL"
  return "PRESSURE"
}

export function resolveHintSessionLimits(
  input: HintPolicyInput
): HintSessionLimitsContract {
  const blocked = input.assistLevel === "BLACKOUT"
  const whispersRemaining = Math.max(
    0,
    HINT_CONFIG.MAX_WHISPERS_PER_ENCOUNTER - input.whispersUsed
  )
  const visionChargesRemaining = Math.max(
    0,
    HINT_CONFIG.MAX_VISION_CHARGES_PER_ENCOUNTER - input.visionChargesUsed
  )
  return {
    whispersRemaining,
    visionChargesRemaining,
    whispersBlocked: blocked,
    visionBlocked: blocked,
  }
}

export function canRequestWhisper(limits: HintSessionLimitsContract): boolean {
  return !limits.whispersBlocked && limits.whispersRemaining > 0
}

export function canSpendVisionCharge(limits: HintSessionLimitsContract): boolean {
  return !limits.visionBlocked && limits.visionChargesRemaining > 0
}

export function resolveHunterVisionReveal(
  ctx: HintWordContextContract,
  assistLevel: AssistLevel
): HunterVisionRevealContract {
  const radicalNote = resolveRadicalNote(ctx.japanese)
  if (assistLevel === "BLACKOUT") {
    return {
      reading: ctx.promptDirection !== "LISTEN_DECODE",
      romaji: false,
      meaning: false,
      radicalNote,
    }
  }
  if (assistLevel === "REDUCED") {
    return {
      reading: true,
      romaji: ctx.promptDirection !== "LISTEN_DECODE",
      meaning: false,
      radicalNote,
    }
  }

  const stage = masteryLearningStage(ctx.masteryScore)
  const showMeaning =
    stage !== "PRESSURE" ||
    ctx.wrongAttempts >= 1 ||
    ctx.promptDirection === "RETRIEVE_JAPANESE" ||
    ctx.promptDirection === "RETRIEVE_READING"

  return {
    reading: true,
    romaji: true,
    meaning: showMeaning,
    radicalNote,
  }
}

export function visionLayersFromReveal(
  reveal: HunterVisionRevealContract
): VisibleLayers {
  return {
    japanese: true,
    reading: reveal.reading,
    romaji: reveal.romaji,
    meaning: reveal.meaning,
  }
}

export function mergeVisibleLayers(
  base: VisibleLayers,
  vision: VisibleLayers
): VisibleLayers {
  return {
    japanese: base.japanese || vision.japanese,
    reading: base.reading || vision.reading,
    romaji: base.romaji || vision.romaji,
    meaning: base.meaning || vision.meaning,
  }
}

export function buildCompanionWhisper(
  ctx: HintWordContextContract,
  options?: { forceFailure?: boolean }
): CompanionWhisperContract {
  const radical = resolveRadicalNote(ctx.japanese)
  const stage = masteryLearningStage(ctx.masteryScore)

  if (options?.forceFailure || ctx.wrongAttempts >= HINT_CONFIG.AUTO_WHISPER_AFTER_WRONG) {
    const gloss = ctx.meaning || "the target gloss"
    return {
      kind: "FAILURE_REINFORCE",
      line: `Signal echo: "${ctx.japanese}" threads through "${gloss}" — intercept the pattern, then retransmit.`,
    }
  }

  if (radical && stage !== "PRESSURE") {
    return {
      kind: "RADICAL",
      line: `Companion whisper: ${radical}`,
    }
  }

  if (stage === "EXPOSURE") {
    return {
      kind: "REPEAT_EXPOSURE",
      line: `You've intercepted this glyph before — anchor "${ctx.reading || ctx.romaji}" before the channel decays.`,
    }
  }

  switch (ctx.promptDirection) {
    case "RETRIEVE_ENGLISH":
      return {
        kind: "PROMPT_NUDGE",
        line: "Lock the English gloss — the Japanese stack is your intel source.",
      }
    case "RETRIEVE_JAPANESE":
    case "RETRIEVE_READING":
      return {
        kind: "PROMPT_NUDGE",
        line: `Reconstruct from meaning: the sector expects "${ctx.japanese}" or its reading.`,
      }
    case "LISTEN_DECODE":
      return {
        kind: "PROMPT_NUDGE",
        line: "Listen for syllable rhythm first — romaji is your decode key.",
      }
    case "SPEAK_JAPANESE":
    case "SPEAK_FROM_PROMPT":
      return {
        kind: "PROMPT_NUDGE",
        line: `Voice imprint required: transmit "${ctx.japanese}" with stable composure.`,
      }
    default:
      return {
        kind: "PATTERN",
        line: "Pattern match the glyph family — radicals repeat across sectors.",
      }
  }
}

export function shouldAutoWhisper(
  wrongAttempts: number,
  lastAutoWhisperAtWrong: number
): boolean {
  return (
    wrongAttempts >= HINT_CONFIG.AUTO_WHISPER_AFTER_WRONG &&
    wrongAttempts > lastAutoWhisperAtWrong
  )
}
