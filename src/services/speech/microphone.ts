/**
 * @deprecated Use `@/systems/speech/microphoneSystem` — kept for backward-compatible imports.
 */
export {
  requestMicrophoneAccess as ensureMicrophoneAccess,
  releaseMicrophoneStream as releaseMicrophone,
  createMicLevelMonitor,
  getActiveMicrophoneStream,
  isMicrophoneActive,
} from "@/systems/speech/microphoneSystem"

export type { MicrophonePermissionStatus as MicrophoneStatus } from "@/systems/speech/microphoneSystem"
