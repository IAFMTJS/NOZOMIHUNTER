import Link from "next/link"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--accent)]">NOZOMI</h1>
        <p className="text-[var(--muted)]">Hunter System — sign in</p>
      </div>
      <LoginForm />
      <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
        Back
      </Link>
    </main>
  )
}
