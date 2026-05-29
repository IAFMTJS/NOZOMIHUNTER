"use client"

import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { DUNGEON_FAILURE_CEREMONY_TEST_ID } from "@/systems/dungeons/dungeonFailureCeremonyFlow"
export interface DungeonFailureCeremonyProps {
  open: boolean
  detailLine?: string | null
  onContinue: () => void
}

export function DungeonFailureCeremony({
  open,
  detailLine,
  onContinue,
}: DungeonFailureCeremonyProps) {
  if (!open) return null

  const line =
    detailLine ??
    "Extraction compromised — penalties incoming. Return when the corridor cools."

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay-heavy)] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="alertdialog"
      aria-modal
      aria-labelledby="dungeon-failure-title"
      data-testid={DUNGEON_FAILURE_CEREMONY_TEST_ID}
    >
      <Panel tone="danger" className="nozomi-vfx-glitch-kanji max-w-md w-full text-center">
        <h2
          id="dungeon-failure-title"
          className="font-display text-lg font-bold tracking-wide text-[var(--foreground)]"
        >
          Corridor breach failed
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{line}</p>
        <p className="mt-2 text-xs text-[var(--warning)]">
          You were not ready — the signal remembers.
        </p>
        <Button className="mt-6 w-full" size="md" onClick={onContinue}>
          Accept consequence
        </Button>
      </Panel>
    </motion.div>
  )
}
