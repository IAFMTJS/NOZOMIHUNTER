import { Suspense } from "react"
import { ContractsClient } from "@/features/contracts/components/ContractsClient"

export default function ContractsPage() {
  return (
    <Suspense fallback={<p className="p-4 text-[var(--muted)]">Loading mission log…</p>}>
      <ContractsClient />
    </Suspense>
  )
}
