export interface SilenceDetectionConfig {
  /** Normalized level 0–1 below which audio counts as silence */
  threshold: number
  /** Ms of continuous silence before auto-stop */
  silenceDurationMs: number
  /** Minimum recording length before silence can trigger stop */
  minRecordingMs: number
}

export const DEFAULT_SILENCE_CONFIG: SilenceDetectionConfig = {
  threshold: 0.04,
  silenceDurationMs: 1800,
  minRecordingMs: 600,
}

export interface SilenceDetector {
  feedLevel(level: number): void
  shouldStop(nowMs?: number): boolean
  reset(): void
  dispose(): void
}

export function createSilenceDetector(
  config: SilenceDetectionConfig = DEFAULT_SILENCE_CONFIG,
  onAutoStop?: () => void
): SilenceDetector {
  let silenceStartedAt: number | null = null
  let recordingStartedAt = Date.now()
  let disposed = false

  return {
    feedLevel(level: number) {
      if (disposed) return
      const now = Date.now()
      const elapsed = now - recordingStartedAt
      if (elapsed < config.minRecordingMs) {
        silenceStartedAt = null
        return
      }

      if (level < config.threshold) {
        if (silenceStartedAt === null) silenceStartedAt = now
        if (
          silenceStartedAt !== null &&
          now - silenceStartedAt >= config.silenceDurationMs
        ) {
          onAutoStop?.()
        }
      } else {
        silenceStartedAt = null
      }
    },
    shouldStop(nowMs = Date.now()) {
      if (silenceStartedAt === null) return false
      const elapsed = nowMs - recordingStartedAt
      if (elapsed < config.minRecordingMs) return false
      return nowMs - silenceStartedAt >= config.silenceDurationMs
    },
    reset() {
      silenceStartedAt = null
      recordingStartedAt = Date.now()
    },
    dispose() {
      disposed = true
      silenceStartedAt = null
    },
  }
}
