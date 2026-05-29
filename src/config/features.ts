export const FEATURE_FLAGS = {
  MULTIPLAYER: false,
  RAIDS: false,
  VOICE_CHAT: false,
  ADVANCED_AI_MEMORY: false,
  DYNAMIC_DUNGEONS: true,
  SPEECH_ANALYSIS: true,
  /** MediaRecorder + browser STT pipeline (no server upload / no paid APIs) */
  SPEECH_RECORDING: true,
  AI_CONVERSATION: true,
  JMDICT_ENGINE: true,
  /** Co-op: audio-only vs visual-only operators (future) */
  DUAL_OPERATOR: false,
  /** Weekly sector instability events on home + rewards */
  LIVE_SECTOR_EVENTS: true,
} as const
