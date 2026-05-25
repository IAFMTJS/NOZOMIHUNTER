import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import type {
  EchoListeningChunkContract,
  EchoListeningRoundContract,
  ListeningFragmentContract,
} from "@/contracts/encounter-contract"

function buildChunks(fragment: ListeningFragmentContract): EchoListeningChunkContract[] {
  const parts = fragment.romaji.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) {
    const label = fragment.japanese || fragment.romaji
    return [
      { id: "c0", label, orderIndex: 0 },
      { id: "c1", label: fragment.meanings[0] ?? label, orderIndex: 1 },
    ]
  }
  return parts.map((label, orderIndex) => ({
    id: `c${orderIndex}`,
    label,
    orderIndex,
  }))
}

/** Single-playback listening with phrase reconstruction tiles. */
export function createEchoListeningEncounter() {
  const encounter = createListeningEncounter(
    1,
    "Echo listening: one playback — reconstruct the phrase."
  )
  return { ...encounter, replayBudget: 1 }
}

export function createEchoListeningRound(): EchoListeningRoundContract {
  const listening = createEchoListeningEncounter()
  const fragment = listening.fragments[0]!
  const chunks = buildChunks(fragment).sort(() => Math.random() - 0.5)
  return {
    fragment,
    chunks,
    selectedIds: [],
    heardOnce: false,
  }
}

export function markEchoHeard(
  round: EchoListeningRoundContract
): EchoListeningRoundContract {
  return { ...round, heardOnce: true }
}

export function selectEchoChunk(
  round: EchoListeningRoundContract,
  chunkId: string
): EchoListeningRoundContract {
  if (round.selectedIds.includes(chunkId)) return round
  return { ...round, selectedIds: [...round.selectedIds, chunkId] }
}

export function clearEchoSelection(
  round: EchoListeningRoundContract
): EchoListeningRoundContract {
  return { ...round, selectedIds: [] }
}

export function checkEchoReconstruction(
  round: EchoListeningRoundContract
): boolean {
  if (round.selectedIds.length !== round.chunks.length) return false
  const ordered = round.selectedIds
    .map((id) => round.chunks.find((c) => c.id === id))
    .filter((c): c is EchoListeningChunkContract => !!c)
  for (let i = 0; i < ordered.length; i++) {
    if (ordered[i]!.orderIndex !== i) return false
  }
  return true
}

export function echoAnswerFromRound(round: EchoListeningRoundContract): string {
  return round.selectedIds
    .map((id) => round.chunks.find((c) => c.id === id)?.label ?? "")
    .join(" ")
    .trim()
}
