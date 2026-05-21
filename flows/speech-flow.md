# Speech Flow (Phase 4)

Player opens SPEECH quest
↓
Phrase displayed (from vocabulary catalog)
↓
Voice: Web Speech API (`useBrowserSpeech`, ja-JP) OR typed transcript fallback
↓
`transcribeAndAnalyze` (rate-limited via `speechGuard`)
↓
Pronunciation Analysis
↓
Hesitation Detection
↓
Timing Analysis (response time ms)
↓
Confidence Analysis
↓
Composite Score + pass/fail vs difficulty threshold
↓
Quest objective advance or wrong-attempt penalty
↓
XP on quest complete (existing progression path)
↓
Save progress (quest_snapshot)
↓
Trigger Events

Events:
- SPEECH_RECORDED
- SPEECH_ANALYZED
- XP_GAINED (on quest complete)

Note: No Whisper or paid STT — see `DECISIONS.md`.
