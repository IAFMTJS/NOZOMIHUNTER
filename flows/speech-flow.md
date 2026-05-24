# Speech Flow (Phase 4+)

Player opens SPEECH quest or dungeon speech sector
↓
Phrase displayed (from vocabulary catalog) — meaning-only prompt (`SPEAK_JAPANESE`); masked rails via `EncounterDisplayProvider`
↓
**Recording state machine** (`recordingStateSystem`)
- IDLE → REQUESTING_PERMISSION → RECORDING → PROCESSING → COMPLETED | ERROR
↓
`speechProcessingSystem.startSpeechRecording` (requires `FEATURE_FLAGS.SPEECH_RECORDING`)
- `beginMicrophoneRequest` called synchronously on tap (iOS permission prompt)
- `speechContextSystem` blocks LAN `http://192.168.x.x` — use `npm run dev:mobile` (HTTPS)
- `microphoneSystem` resolves stream, level monitor, `track.stop()` cleanup
- `MediaRecorder` captures `audio/webm` (fallback `audio/mp4` on Safari)
- `browserSpeechRecognitionSystem` live transcript (Chrome/Edge) in parallel
- `silenceDetectionSystem` optional auto-stop on sustained silence
↓
Player stops → `stopSpeechRecording`
↓
`clientTranscriptionSystem.resolveClientTranscript` — browser STT only, no server upload
↓
`transcribeAndAnalyze` (rate-limited via `speechGuard` + `check_player_rate_limit` RPC)
↓
Pronunciation → Hesitation → Timing → Confidence → Composite
↓
`speechEncounterSystem.applySpeechAnalysis` → quest objective / wrong attempts
↓
XP on quest complete (progression path)
↓
Save progress (quest_snapshot)
↓
Events: `SPEECH_RECORDED`, `SPEECH_ANALYZED`

Recovery: `speechRecoverySystem` clears stale RECORDING/PROCESSING on page hide or timeout.

Debug: `NEXT_PUBLIC_SPEECH_DEBUG=true` → `MIC ACTIVE | STATE: … | STT: …`

Components: `SpeechEncounter` + `useSpeechRecording` — display state only; no gameplay logic.
