import Link from "next/link"

export function SupabaseSetupNotice() {
  return (
    <div
      className="mb-6 rounded border border-amber-600/50 bg-amber-950/40 p-4 text-sm"
      role="alert"
    >
      <p className="font-semibold text-amber-200">Supabase not configured</p>
      <ol className="mt-2 list-inside list-decimal space-y-1 text-amber-100/90">
        <li>
          Copy <code className="rounded bg-black/40 px-1">.env.example</code> to{" "}
          <code className="rounded bg-black/40 px-1">.env.local</code>
        </li>
        <li>
          Paste your project URL and anon key from{" "}
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Supabase API settings
          </a>
        </li>
        <li>
          Restart <code className="rounded bg-black/40 px-1">npm run dev</code>
        </li>
      </ol>
      <p className="mt-2 text-[var(--muted)]">
        See <Link href="/login" className="underline">login</Link> or{" "}
        <code className="rounded bg-black/40 px-1">docs/supabase-setup.md</code>{" "}
        for auth provider steps.
      </p>
    </div>
  )
}
