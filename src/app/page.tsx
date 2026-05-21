import Link from "next/link"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-8">
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
