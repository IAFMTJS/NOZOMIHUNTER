/** Ceremony display priority — lower runs first when multiple queues have items. */
export const CEREMONY_QUEUE_PRIORITY = {
  syncDiscipline: 0,
  levelUp: 1,
  rankUp: 2,
  achievement: 3,
  masteryTier: 4,
  wordBind: 5,
  archiveUnlock: 6,
  trainingResults: 7,
  dungeonClear: 8,
} as const

export type CeremonyQueueKind = keyof typeof CEREMONY_QUEUE_PRIORITY

export function pickActiveCeremonyQueue(
  queues: Partial<Record<CeremonyQueueKind, unknown[] | string | null>>
): CeremonyQueueKind | null {
  const candidates = (Object.keys(CEREMONY_QUEUE_PRIORITY) as CeremonyQueueKind[])
    .filter((kind) => {
      const value = queues[kind]
      if (value == null) return false
      if (typeof value === "string") return value.length > 0
      return Array.isArray(value) && value.length > 0
    })
    .sort(
      (a, b) =>
        CEREMONY_QUEUE_PRIORITY[a] - CEREMONY_QUEUE_PRIORITY[b]
    )
  return candidates[0] ?? null
}

export function shouldDeferCeremony(
  activeKind: CeremonyQueueKind | null,
  candidateKind: CeremonyQueueKind
): boolean {
  if (!activeKind) return false
  return CEREMONY_QUEUE_PRIORITY[candidateKind] > CEREMONY_QUEUE_PRIORITY[activeKind]
}
