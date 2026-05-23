"use client"

import { Button } from "@/components/ui/Button"

export function HubBack({
  onBack,
  label,
  operationCode,
}: {
  onBack: () => void
  label: string
  operationCode?: string
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      {operationCode && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {operationCode}
        </p>
      )}
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← {label}
      </Button>
    </div>
  )
}
