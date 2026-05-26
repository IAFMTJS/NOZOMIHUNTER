import { HunterPage } from "@/components/layout/HunterPage"

export default function TrainingLoading() {
  return (
    <HunterPage className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-white/10" />
        ))}
      </div>
    </HunterPage>
  )
}
