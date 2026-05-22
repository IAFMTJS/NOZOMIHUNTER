import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { AtmosphericBackground } from "@/components/layout/AtmosphericBackground"

export default function LoginPage() {
  return (
    <AtmosphericBackground>
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-[0.08em] text-[var(--foreground)]">
            NOZOMI
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to access the contract board
          </p>
        </div>
        <Suspense fallback={<p className="text-[var(--muted)]">Loading...</p>}>
          <LoginForm />
        </Suspense>
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          Back
        </Link>
      </main>
    </AtmosphericBackground>
  )
}
