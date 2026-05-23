import { Suspense } from "react"
import { InventoryClient } from "@/features/inventory/components/InventoryClient"

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <p className="p-4 text-sm text-[var(--muted)]">Loading loadout…</p>
      }
    >
      <InventoryClient />
    </Suspense>
  )
}
