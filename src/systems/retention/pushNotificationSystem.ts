import {
  deactivatePushSubscription,
  savePushSubscription,
  type PushSubscriptionJson,
} from "@/services/supabase/pushSubscriptionRepository"

const PUSH_OPT_IN_KEY = "nozomi-push-opt-in"

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
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function isPushConfigured(): boolean {
  return isPushSupported() && vapidPublicKey() != null
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

/** Subscribe via VAPID and persist for GitHub Actions delivery. */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushConfigured()) return false
  const permission = await requestPushPermission()
  if (permission !== "granted") return false

  try {
    const reg = await navigator.serviceWorker.ready
    if (!reg.pushManager) return false

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
    void navigator.serviceWorker.ready.then((reg) => {
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
