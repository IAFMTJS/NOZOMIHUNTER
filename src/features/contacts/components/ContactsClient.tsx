"use client"

import { useCallback, useEffect, useState } from "react"
import { HunterPage } from "@/components/layout/HunterPage"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"
import {
  loadContactDialogueState,
  persistContactDialogueBranch,
} from "@/services/contacts/contactDialogueService"
import {
  pickContactDialogue,
  type ContactDialogueBranch,
} from "@/systems/contacts/contactDialogueSystem"
import { GameAssetImage } from "@/components/ui/GameAssetImage"
import { buildSectorCorruptionView } from "@/systems/world/sectorCorruptionSystem"
import { irisWarningLine } from "@/systems/messaging/npcMessageSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"

const NPC_CONTACTS = [
  { key: "iris", label: "Iris", role: "Sector analyst" },
  { key: "operator-7", label: "Operator 7", role: "Dispatch liaison" },
  { key: "archivist", label: "The Archivist", role: "Shadow Archive" },
] as const

export function ContactsClient() {
  const { user } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const sectorWarning =
    player != null
      ? irisWarningLine(buildSectorCorruptionView(player, []).band)
      : null
  const [trust, setTrust] = useState<Record<string, number>>({})
  const [branchByNpc, setBranchByNpc] = useState<Record<string, ContactDialogueBranch>>(
    {}
  )
  const [activeNpc, setActiveNpc] = useState<string | null>(null)
  const [persisting, setPersisting] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    void (async () => {
      const nextTrust: Record<string, number> = {}
      const nextBranch: Record<string, ContactDialogueBranch> = {}
      for (const npc of NPC_CONTACTS) {
        const state = await loadContactDialogueState(user.id, npc.key)
        nextTrust[npc.key] = state.trust
        nextBranch[npc.key] = state.branch
      }
      setTrust(nextTrust)
      setBranchByNpc(nextBranch)
    })()
  }, [user?.id])

  const selectBranch = useCallback(
    async (npcKey: string, branch: ContactDialogueBranch) => {
      if (!user?.id) return
      const t = trust[npcKey] ?? 50
      setBranchByNpc((prev) => ({ ...prev, [npcKey]: branch }))
      setPersisting(true)
      try {
        await persistContactDialogueBranch(user.id, npcKey, branch, t)
      } finally {
        setPersisting(false)
      }
    },
    [trust, user?.id]
  )

  return (
    <HunterPage className="nozomi-screen-contacts space-y-6">
      {sectorWarning && (
        <p className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-xs text-[var(--danger)]">
          Iris: {sectorWarning}
        </p>
      )}
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Contacts</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Trust vectors — dialogue memory persists across sessions
        </p>
      </div>
      <div className="mt-4 space-y-3" data-testid="contacts-list">
        {NPC_CONTACTS.map((npc) => {
          const t = trust[npc.key] ?? 50
          const branch = branchByNpc[npc.key] ?? "greeting"
          const open = activeNpc === npc.key
          return (
            <Panel key={npc.key} className="flex gap-3">
              {npc.key === "iris" && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <GameAssetImage assetKey="npc.iris.portrait" alt="" fill />
                </div>
              )}
              <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold">{npc.label}</p>
              <p className="text-xs text-[var(--muted)]">{npc.role}</p>
              <p className="mt-2 text-sm">
                Trust:{" "}
                <span className="text-[var(--accent-bright)]">{t}</span> / 100
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setActiveNpc(open ? null : npc.key)
                  if (!open && user?.id) {
                    void selectBranch(npc.key, branch)
                  }
                }}
              >
                {open ? "Close channel" : "Open channel"}
              </Button>
              {open && (
                <div className="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-3">
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    {pickContactDialogue(npc.key, branch, t)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["greeting", "Greet"],
                        ["briefing", "Briefing"],
                        ["trust", "Trust"],
                      ] as const
                    ).map(([id, label]) => (
                      <Button
                        key={id}
                        variant={branch === id ? "cta" : "ghost"}
                        size="sm"
                        disabled={persisting}
                        onClick={() => void selectBranch(npc.key, id)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </Panel>
          )
        })}
      </div>
    </HunterPage>
  )
}
