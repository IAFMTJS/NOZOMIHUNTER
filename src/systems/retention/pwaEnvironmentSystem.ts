/** Detect installed PWA / iOS home-screen context. */

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** iOS Web Push (16.4+) only works in an installed PWA, not Safari tabs. */
export function isIosPwaPushContext(): boolean {
  return isIosDevice() && isStandalonePwa()
}
