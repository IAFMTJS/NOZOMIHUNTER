"use client"

import { useEffect, useState } from "react"
import {
  isAudioMuted,
  setAudioMuted,
  unlockAudio,
} from "@/systems/audio/audioSystem"
import { Button } from "@/components/ui/Button"

export function AudioMuteToggle() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(isAudioMuted())
  }, [])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        unlockAudio()
        const next = !isAudioMuted()
        setAudioMuted(next)
        setMuted(next)
      }}
      aria-pressed={muted}
      title={muted ? "Enable audio" : "Mute audio"}
    >
      {muted ? "Audio off" : "Audio on"}
    </Button>
  )
}
