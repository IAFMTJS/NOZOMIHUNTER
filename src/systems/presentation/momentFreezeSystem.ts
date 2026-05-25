let freezeUntil = 0

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Brief global dim for ceremony beats; no-op when reduced motion. */
export function triggerMomentFreeze(ms: number): void {
  if (typeof document === "undefined" || ms <= 0 || prefersReducedMotion()) return
  freezeUntil = Date.now() + ms
  document.documentElement.classList.add("nozomi-moment-freeze")
  window.setTimeout(() => {
    if (Date.now() >= freezeUntil) {
      document.documentElement.classList.remove("nozomi-moment-freeze")
    }
  }, ms + 50)
}

export function isMomentFrozen(): boolean {
  return Date.now() < freezeUntil
}
