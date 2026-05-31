import {
  deactivatePushSubscription,
  savePushSubscription,
  type PushSubscriptionJson,
} from "@/services/supabase/pushSubscriptionRepository"
import {
  isIosDevice,
  isIosPwaPushContext,
  isStandalonePwa,
} from "@/systems/retention/pwaEnvironmentSystem"

const PUSH_OPT_IN_KEY = "nozomi-push-opt-in"
export const PUSH_PROMPT_DISMISS_KEY = "nozomi-push-prompt-dismissed"

function vapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  return key || null
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false
  // iOS exposes PushManager only in home-screen PWA (16.4+).
  if (isIosDevice() && !isStandalonePwa()) return false
  return "PushManager" in window
}

export function isPushConfigured(): boolean {
  return isPushSupported() && vapidPublicKey() != null
}

export function pushPermissionState(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission
}

export function isPushOptIn(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(PUSH_OPT_IN_KEY) === "1"
  } catch {
    return false
  }
}

export function setPushOptIn(value: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PUSH_OPT_IN_KEY, value ? "1" : "0")
  } catch {
    /* ignore */
  }
}

export function isPushPromptDismissed(): boolean {
  if (typeof window === "undefined") return true
  try {
    return localStorage.getItem(PUSH_PROMPT_DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

export function dismissPushPermissionPrompt(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PUSH_PROMPT_DISMISS_KEY, "1")
  } catch {
    /* ignore */
  }
}

/** First launch after PWA install — permission still default, not dismissed. */
export function shouldShowPushPermissionPrompt(): boolean {
  if (!isPushConfigured()) return false
  if (!isStandalonePwa()) return false
  if (isPushPromptDismissed()) return false
  if (Notification.permission === "denied") return false
  if (Notification.permission === "granted" && isPushOptIn()) return false
  return (
    Notification.permission === "default" ||
    (Notification.permission === "granted" && !isPushOptIn())
  )
}

export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null
  try {
    await navigator.serviceWorker.register("/sw.js")
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied"
  return Notification.requestPermission()
}

function subscriptionToJson(sub: PushSubscription): PushSubscriptionJson {
  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription")
  }
  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  }
}

/** Subscribe via VAPID — must be called from a user gesture (iOS requirement). */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushConfigured()) return false

  const reg = await ensurePushServiceWorker()
  if (!reg?.pushManager) return false

  let permission = Notification.permission
  if (permission === "default") {
    permission = await requestPushPermission()
  }
  if (permission !== "granted") return false

  try {
    const publicKey = vapidPublicKey()!
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })
    }

    const saved = await savePushSubscription(userId, subscriptionToJson(sub))
    if (!saved) return false

    setPushOptIn(true)
    try {
      localStorage.removeItem(PUSH_PROMPT_DISMISS_KEY)
    } catch {
      /* ignore */
    }
    return true
  } catch {
    return false
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  setPushOptIn(false)
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager?.getSubscription()
    if (sub) {
      await deactivatePushSubscription(userId, sub.endpoint)
      await sub.unsubscribe()
    }
  } catch {
    /* ignore */
  }
}

export function pushAlertsAvailabilityLabel(): string {
  if (!isPushSupported()) {
    if (isIosDevice() && !isStandalonePwa()) {
      return "Add NOZOMI to your Home Screen to enable alerts."
    }
    return "Notifications are not available on this device."
  }
  if (!vapidPublicKey()) {
    return "Notifications are temporarily unavailable."
  }
  return "Invasion alerts — tap to enable."
}

export function pushUnavailableReason(): string | null {
  if (!vapidPublicKey()) return null
  if (isIosDevice() && !isStandalonePwa()) {
    return "On iPhone: Add to Home Screen, then open NOZOMI from the icon — Safari tabs cannot receive push."
  }
  if (!isPushSupported()) return "Push is not supported on this browser."
  return null
}

/** @deprecated use subscribeToPush */
export const subscribeToPushStub = subscribeToPush

export interface NarrativePushPayload {
  title: string
  body: string
  href?: string
  tag?: string
}

/** Local preview — mirrors GitHub-delivered invasion copy. */
export function scheduleNarrativePushStub(payload: NarrativePushPayload): void {
  if (!isPushOptIn() || typeof window === "undefined") return
  if (Notification.permission !== "granted") return
  try {
    void ensurePushServiceWorker().then((reg) => {
      if (!reg) return
      reg.showNotification(payload.title, {
        body: payload.body,
        tag: payload.tag ?? "nozomi-narrative",
        data: { href: payload.href ?? "/home" },
        icon: "/icons/icon-192.png",
      })
    })
  } catch {
    /* preview only */
  }
}

export { isIosPwaPushContext, isStandalonePwa }
