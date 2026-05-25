export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

export function pulseHaptic(ms: number | number[]): void {
  if (!canVibrate()) return
  if (typeof ms === "number" && ms <= 0) return
  try {
    navigator.vibrate(ms)
  } catch {
    /* ignore */
  }
}

export function hapticForCeremony(kind: "levelUp" | "dungeonClear" | "achievement"): void {
  switch (kind) {
    case "levelUp":
      pulseHaptic(40)
      break
    case "dungeonClear":
      pulseHaptic([30, 20, 50])
      break
    case "achievement":
      pulseHaptic(25)
      break
  }
}
