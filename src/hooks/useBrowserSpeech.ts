"use client"

/**
 * @deprecated Prefer `useSpeechRecording` — thin compatibility wrapper.
 */
export { useSpeechRecording as useBrowserSpeech } from "./useSpeechRecording"
export type { SpeechRecognitionLang } from "@/systems/speech/browserSpeechRecognitionSystem"
