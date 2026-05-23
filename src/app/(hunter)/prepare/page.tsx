import { Suspense } from "react"
import { PrepareClient } from "@/features/preparation/components/PrepareClient"

export default function PreparePage() {
  return (
    <Suspense fallback={<p className="p-4 text-[var(--muted)]">Preparing deployment…</p>}>
      <PrepareClient />
    </Suspense>
  )
}
