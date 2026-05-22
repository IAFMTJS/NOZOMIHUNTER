"use client"

import { useEffect, useState } from "react"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

const DISMISS_KEY = "nozomi_install_dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  useEffect(() => {
    if (isStandalone() || dismissed) return

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", onBip)
    if (isIos()) setVisible(true)

    return () => window.removeEventListener("beforeinstallprompt", onBip)
  }, [dismissed])

  function dismiss() {
    setVisible(false)
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  if (!visible || isStandalone()) return null

  return (
    <Panel tone="inset" className="mb-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Field deployment
      </p>
      <p className="mt-2 text-sm text-[var(--foreground)]">
        {deferred
          ? "Install NOZOMI on this device for fullscreen hunt mode."
          : "On iOS: tap Share, then Add to Home Screen for the hunter client."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {deferred && (
          <Button size="sm" onClick={() => void install()}>
            Install hunter client
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </Panel>
  )
}
