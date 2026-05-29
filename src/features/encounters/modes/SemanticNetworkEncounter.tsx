"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { semanticNetworkComplete } from "@/systems/vocabulary/semanticNetworkSystem"
import { computeEntityThreatIndex } from "@/systems/vocabulary/entityHuntSystem"

interface SemanticNetworkEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onLink: (fromId: string, toId: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function SemanticNetworkEncounter({
  quest,
  disabled,
  onLink,
  onAbandon,
}: SemanticNetworkEncounterProps) {
  const enc = quest.semanticNetworkEncounter
  const [selected, setSelected] = useState<string | null>(null)

  if (!enc) {
    return <p className="text-sm text-[var(--danger)]">Network offline.</p>
  }

  const complete = semanticNetworkComplete(enc.links, enc.matchedLinkIds)
  const threatIndex = computeEntityThreatIndex(
    Math.round((enc.matchedLinkIds.length / Math.max(1, enc.links.length)) * 100),
    "ELEVATED"
  )

  async function pickNode(id: string) {
    if (!selected) {
      setSelected(id)
      return
    }
    if (selected !== id) {
      await onLink(selected, id)
    }
    setSelected(null)
  }

  return (
    <ModeEncounterShell modeLabel="Semantic Network" emotion="Discovery" quest={quest}>
      <Panel tone="inset" className="space-y-3 !p-4 nozomi-entity-network">
        <p className="text-xs text-[var(--muted)]">
          Connect meanings, kanji, and context nodes — investigative analysis.
        </p>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Entity threat index
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-inset)]">
            <div
              className="h-full bg-[var(--danger)] transition-all"
              style={{ width: `${threatIndex}%` }}
            />
          </div>
        </div>
        <NetworkGrid
          nodes={enc.nodes}
          selected={selected}
          disabled={disabled}
          onPick={(id) => void pickNode(id)}
        />
        {complete && (
          <p className="text-xs text-[var(--success)]">Network stabilized.</p>
        )}
        <Button variant="ghost" disabled={disabled} onClick={() => void onAbandon()}>
          Exit analysis
        </Button>
      </Panel>
    </ModeEncounterShell>
  )
}

function NetworkGrid({
  nodes,
  selected,
  disabled,
  onPick,
}: {
  nodes: { id: string; label: string; group: string }[]
  selected: string | null
  disabled?: boolean
  onPick: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {nodes.map((node) => (
        <Button
          key={node.id}
          variant={selected === node.id ? "primary" : "ghost"}
          disabled={disabled}
          className="text-xs"
          onClick={() => onPick(node.id)}
        >
          <span className="block text-[10px] uppercase text-[var(--muted)]">
            {node.group}
          </span>
          {node.label}
        </Button>
      ))}
    </div>
  )
}
