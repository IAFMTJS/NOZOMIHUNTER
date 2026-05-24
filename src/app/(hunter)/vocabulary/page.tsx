import { Suspense } from "react"
import { VocabularyClient } from "@/features/vocabulary/components/VocabularyClient"

export default function VocabularyPage() {
  return (
    <Suspense fallback={<p className="p-4 text-[var(--muted)]">Loading vocabulary…</p>}>
      <VocabularyClient />
    </Suspense>
  )
}
