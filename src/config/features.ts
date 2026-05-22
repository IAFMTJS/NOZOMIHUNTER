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
} as const
