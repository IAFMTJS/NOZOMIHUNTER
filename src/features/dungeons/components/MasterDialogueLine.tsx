"use client"

import { formatMasterDialogueBanner } from "@/systems/presentation/dungeonMasterPresentation"

interface MasterDialogueLineProps {
  line: string | null | undefined
  masterName?: string
}

export function MasterDialogueLine({ line, masterName }: MasterDialogueLineProps) {
  const text = formatMasterDialogueBanner(line)
  if (!text) return null
  return (
    <p
      className="nozomi-master-dialogue text-xs uppercase tracking-[0.18em] text-[var(--accent-bright)]"
      role="status"
    >
      {masterName ? (
        <>
          <span className="text-[var(--muted)]">{masterName} · </span>
          {text}
        </>
      ) : (
        text
      )}
    </p>
  )
}
