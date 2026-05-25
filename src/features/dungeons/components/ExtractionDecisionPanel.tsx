"use client"

import type { DungeonExtractionChoice } from "@/contracts/dungeon-contract"
import { Button } from "@/components/ui/Button"
import { Panel } from "@/components/ui/Panel"

interface ExtractionDecisionPanelProps {
  disabled?: boolean
  onChoose: (choice: DungeonExtractionChoice) => Promise<void>
}

export function ExtractionDecisionPanel({
  disabled,
  onChoose,
}: ExtractionDecisionPanelProps) {
  return (
    <Panel tone="boss" className="flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent-bright)]">
        Extraction decision
      </p>
      <p className="text-sm text-[var(--muted)]">
        Extract now for safe rewards and preserved relics, or push deeper for bonus word
        data at corruption risk.
      </p>
      <Button disabled={disabled} onClick={() => onChoose("EXTRACT_SAFE")}>
        Extract now (safe)
      </Button>
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => onChoose("PUSH_DEEPER")}
      >
        Push deeper (risk)
      </Button>
    </Panel>
  )
}
