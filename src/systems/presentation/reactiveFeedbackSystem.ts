export interface ReactiveToast {
  id: string
  message: string
  className: string
}

let seq = 0

export function nextReactiveToast(
  kind: "xp" | "warning" | "glitch" | "level",
  payload?: { xpGained?: number; level?: number }
): ReactiveToast {
  seq += 1
  switch (kind) {
    case "xp":
      return {
        id: `toast-${seq}`,
        message: `+${payload?.xpGained ?? 0} XP`,
        className:
          "border-[var(--reward)]/40 bg-[var(--surface)] text-[var(--reward)] nozomi-flash-success",
      }
    case "level":
      return {
        id: `toast-${seq}`,
        message: `LEVEL ${payload?.level ?? "?"} — Registry sync`,
        className:
          "border-[var(--accent)]/50 bg-[var(--surface)] text-[var(--accent-bright)]",
      }
    case "glitch":
      return {
        id: `toast-${seq}`,
        message: "Signal mismatch — system observing",
        className:
          "border-[var(--danger)]/40 bg-[var(--surface)] text-[var(--danger)] nozomi-flash-danger",
      }
    default:
      return {
        id: `toast-${seq}`,
        message: "Penalty threshold crossed",
        className:
          "border-[var(--warning)]/40 bg-[var(--surface)] text-[var(--warning)]",
      }
  }
}
