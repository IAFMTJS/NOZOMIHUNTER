"use client"

import { Panel } from "@/components/ui/Panel"

/** Placeholder for future codename / title customization UI. */
export function HunterIdentityStub() {
  return (
    <Panel tone="inset" className="mt-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Identity registry
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Codename seals and equipped titles will be editable in a future patch.
        Progression titles below remain read-only for now.
      </p>
    </Panel>
  )
}
