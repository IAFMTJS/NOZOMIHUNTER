"use client"

import { useCallback, useEffect, useState } from "react"
import type { SpeechRecognitionLang } from "@/systems/speech/browserSpeechRecognitionSystem"
import {
  isBrowserSpeechRecognitionSupported,
} from "@/systems/speech/browserSpeechRecognitionSystem"
import { isSecureSpeechContext } from "@/systems/speech/audioFormatSystem"
import { beginMicrophoneRequest } from "@/systems/speech/microphoneSystem"
import {
  getMicrophoneAccessHint,
  getMicrophoneAccessIssue,
  type MicrophoneAccessIssue,
} from "@/systems/speech/speechContextSystem"
import {
  cancelSpeechRecording,
  isSpeechRecordingSupported,
  resetSpeechSession,
  setSpeechLevelCallback,
  setSpeechTranscriptCallback,
  startSpeechRecording,
  stopSpeechRecording,
  getSpeechResponseTimeMs,
} from "@/systems/speech/speechProcessingSystem"
import {
  getRecordingSnapshot,
  subscribeRecordingState,
} from "@/systems/speech/recordingStateSystem"
import { RECORDING_STATES, type RecordingStateSnapshot } from "@/systems/speech/recordingStateTypes"
import {
  installSpeechRecoveryHandlers,
  uninstallSpeechRecoveryHandlers,
} from "@/systems/speech/speechRecoverySystem"

export function useSpeechRecording(initialLang: SpeechRecognitionLang = "en-US") {
  const [snapshot, setSnapshot] = useState<RecordingStateSnapshot>(() =>
    getRecordingSnapshot()
  )
  const [lang, setLang] = useState<SpeechRecognitionLang>(initialLang)
  const [micLevel, setMicLevel] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [capabilities, setCapabilities] = useState<{
    supported: boolean
    browserStt: boolean
    secure: boolean
    micIssue: MicrophoneAccessIssue
  }>({
    supported: false,
    browserStt: false,
    secure: false,
    micIssue: "api-unavailable",
  })

  useEffect(() => {
    const micIssue = getMicrophoneAccessIssue()
    setCapabilities({
      supported: isSpeechRecordingSupported(),
      browserStt: isBrowserSpeechRecognitionSupported(),
      secure: isSecureSpeechContext(),
      micIssue,
    })
  }, [])

  const supported = capabilities.supported
  const recording =
    snapshot.state === RECORDING_STATES.RECORDING ||
    snapshot.state === RECORDING_STATES.REQUESTING_PERMISSION
  const processing = snapshot.state === RECORDING_STATES.PROCESSING

  useEffect(() => {
    installSpeechRecoveryHandlers()
    const unsub = subscribeRecordingState(setSnapshot)
    setSpeechLevelCallback(setMicLevel)
    setSpeechTranscriptCallback(setLiveTranscript)
    return () => {
      unsub()
      setSpeechLevelCallback(null)
      setSpeechTranscriptCallback(null)
      cancelSpeechRecording()
      uninstallSpeechRecoveryHandlers()
    }
  }, [])

  const captureMicFromGesture = useCallback(() => beginMicrophoneRequest(), [])

  const start = useCallback(
    async (preflightMic?: Promise<MediaStream> | null) => {
      if (recording || processing) return
      setLiveTranscript("")
      resetSpeechSession()
      const result = await startSpeechRecording(lang, preflightMic ?? undefined)
      if (!result.ok && result.error) {
        setSnapshot(getRecordingSnapshot())
      }
    },
    [lang, recording, processing]
  )

  const stopAndGetTranscript = useCallback(async () => {
    if (!recording && !processing) {
      return { transcript: liveTranscript, responseTimeMs: getSpeechResponseTimeMs(), ok: true }
    }
    const result = await stopSpeechRecording()
    if (result.ok) {
      setLiveTranscript(result.transcript)
      resetSpeechSession()
    }
    return result
  }, [recording, processing, liveTranscript])

  const stop = useCallback(() => {
    void stopAndGetTranscript()
  }, [stopAndGetTranscript])

  const clearTranscript = useCallback(() => {
    setLiveTranscript("")
    resetSpeechSession()
  }, [])

  const changeLang = useCallback((next: SpeechRecognitionLang) => {
    setLang(next)
  }, [])

  return {
    supported,
    micAccessHint: getMicrophoneAccessHint(capabilities.micIssue),
    micAccessIssue: capabilities.micIssue,
    browserSttSupported: capabilities.browserStt,
    secureContext: capabilities.secure,
    captureMicFromGesture,
    snapshot,
    state: snapshot.state,
    error: snapshot.error,
    uploadStatus: snapshot.uploadStatus,
    transcriptionStatus: snapshot.transcriptionStatus,
    retryCount: snapshot.retryCount,
    recording,
    processing,
    listening: recording,
    micLevel,
    micReady: snapshot.micActive || snapshot.state === RECORDING_STATES.RECORDING,
    transcript: liveTranscript,
    lang,
    setLang: changeLang,
    start,
    stop,
    stopAndGetTranscript,
    getResponseTimeMs: getSpeechResponseTimeMs,
    clearTranscript,
    cancel: cancelSpeechRecording,
  }
}
