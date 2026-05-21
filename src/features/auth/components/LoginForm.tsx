"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed")
      setBusy(false)
    }
  }

  async function handleGuest() {
    setBusy(true)
    setError(null)
    try {
      await signInAsGuest()
      window.location.href = "/dashboard"
    } catch (e) {
      setError(e instanceof Error ? e.message : "Guest sign-in failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Loading...</p>
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <button
        type="button"
        disabled={busy}
        onClick={handleGoogle}
        className="rounded border border-[var(--accent)] px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
      >
        Continue with Google
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={handleGuest}
        className="rounded border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
      >
        Enter as Guest
      </button>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <p className="text-xs text-[var(--muted)]">
        Configure Supabase URL and keys in .env.local. Enable Google OAuth and
        anonymous sign-in in your project dashboard.
      </p>
    </div>
  )
}
