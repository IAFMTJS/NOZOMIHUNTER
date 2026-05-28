"use client"

import { useState } from "react"
import type { HubView } from "@/features/hub/ContractHub"

export function useHunterHubState() {
  const [hubView, setHubView] = useState<HubView>("menu")
  const [hubFocusQuestId, setHubFocusQuestId] = useState<string | null>(null)
  return {
    hubView,
    setHubView,
    hubFocusQuestId,
    setHubFocusQuestId,
  }
}
