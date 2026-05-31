"use client"

import { useCallback, useEffect, useState } from "react"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import {
  dismissPushPermissionPrompt,
  isIosPwaPushContext,
  shouldShowPushPermissionPrompt,
  subscribeToPush,
} from "@/systems/retention/pushNotificationSystem"

interface PushPermissionPromptProps {
  userId: string
}

export function PushPermissionPrompt({ userId }: PushPermissionPromptProps) {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setVisible(shouldShowPushPermissionPrompt())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function enableAlerts() {
    setBusy(true)
    setError(null)
    try {
      const ok = await subscribeToPush(userId)
      if (ok) {
        setVisible(false)
      } else {
        setError("Could not enable alerts. Check Settings → Invasion alerts.")
      }
    } finally {
      setBusy(false)
    }
  }

  function dismiss() {
    dismissPushPermissionPrompt()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Panel tone="inset" className="mb-4" data-testid="push-permission-prompt">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Field alerts
      </p>
      <p className="mt-2 text-sm text-[var(--foreground)]">
        {isIosPwaPushContext()
          ? "Allow invasion alerts so NOZOMI can reach you when language anomalies spike — iOS requires this once per install."
          : "Allow invasion alerts when language anomalies spike in your sectors."}
      </p>
      {error && <p className="mt-2 text-xs text-[var(--warning)]">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void enableAlerts()}>
          {busy ? "Requesting…" : "Allow invasion alerts"}
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={dismiss}>
          Not now
        </Button>
      </div>
    </Panel>
  )
}
