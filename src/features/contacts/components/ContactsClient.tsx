"use client"

import { useEffect, useState } from "react"
import { HunterPage } from "@/components/layout/HunterPage"
import { Panel } from "@/components/ui/Panel"
import { useAuth } from "@/hooks/useAuth"
import { loadNpcRelationship } from "@/services/supabase/relationshipRepository"
import { RELATIONSHIP_TRUST_DEFAULT } from "@/systems/contracts/relationshipSystem"

const NPC_CONTACTS = [
  { key: "operator-7", label: "Operator 7", role: "Dispatch liaison" },
  { key: "archivist", label: "The Archivist", role: "Shadow Archive" },
] as const

export function ContactsClient() {
  const { user } = useAuth()
  const [trust, setTrust] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user?.id) return
    void (async () => {
      const next: Record<string, number> = {}
      for (const npc of NPC_CONTACTS) {
        const row = await loadNpcRelationship(user.id, npc.key)
        next[npc.key] = row?.trust ?? RELATIONSHIP_TRUST_DEFAULT
      }
      setTrust(next)
    })()
  }, [user?.id])

  return (
    <HunterPage>
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Contacts</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Trust vectors — dialogue memory persists
        </p>
      </div>
      <div className="mt-4 space-y-3" data-testid="contacts-list">
        {NPC_CONTACTS.map((npc) => (
          <Panel key={npc.key}>
            <p className="font-display text-sm font-semibold">{npc.label}</p>
            <p className="text-xs text-[var(--muted)]">{npc.role}</p>
            <p className="mt-2 text-sm">
              Trust:{" "}
              <span className="text-[var(--accent-bright)]">
                {trust[npc.key] ?? "—"}
              </span>
              / 100
            </p>
          </Panel>
        ))}
      </div>
    </HunterPage>
  )
}
