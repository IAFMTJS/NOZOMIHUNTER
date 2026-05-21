import Link from "next/link"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export default function HomePage() {
  const configured = isSupabaseConfigured()

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-8">
      {!configured && (
        <div className="w-full">
          <SupabaseSetupNotice />
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-[var(--accent)]">
        NOZOMI
      </h1>
      <p className="text-center text-[var(--muted)]">
        Hunter System — language is gameplay.
      </p>
      <Link
        href="/login"
        className="rounded border border-[var(--accent)] px-6 py-2 text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black"
      >
        Enter
      </Link>
    </main>
  )
}
