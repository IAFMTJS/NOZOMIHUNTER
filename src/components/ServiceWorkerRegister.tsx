"use client"

import { useEffect } from "react"
import { isStandalonePwa } from "@/systems/retention/pwaEnvironmentSystem"

export function ServiceWorkerRegister() {
  useEffect(() => {
    const shouldRegister =
      process.env.NODE_ENV === "production" || isStandalonePwa()
    if (!shouldRegister) return
    if (!("serviceWorker" in navigator)) return

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional offline shell */
    })
  }, [])

  return null
}
