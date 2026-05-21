"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"

type AuthMode = "signin" | "signup" | "magic"

const CALLBACK_ERRORS: Record<string, string> = {
  auth: "Sign-in failed. Try again or use another method.",
  config: "Supabase is not configured on the server.",
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithGoogle,
    signInAsGuest,
    loading,
    configured,
  } = useAuth()

  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("error")
    if (code && CALLBACK_ERRORS[code]) {
      setError(CALLBACK_ERRORS[code])
    }
  }, [searchParams])

  async function goToDashboard() {
    window.location.href = "/dashboard"
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === "signup") {
        await signUpWithEmail(email.trim(), password)
        setNotice(
          "Account created. If email confirmation is enabled, check your inbox; otherwise sign in below."
        )
        setMode("signin")
      } else {
        await signInWithEmail(email.trim(), password)
        await goToDashboard()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email sign-in failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await signInWithMagicLink(email.trim())
      setNotice("Magic link sent. Open the email to finish signing in.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Magic link failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth sign-in failed")
      setBusy(false)
    }
  }

  async function handleGuest() {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await signInAsGuest()
      await goToDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guest sign-in failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Loading session...</p>
  }

  if (!configured) {
    return (
      <div className="w-full max-w-md">
        <SupabaseSetupNotice />
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex gap-2 text-sm">
        {(["signin", "signup", "magic"] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(m)
              setError(null)
              setNotice(null)
            }}
            className={`rounded px-3 py-1 ${
              mode === m
                ? "bg-[var(--accent)] text-black"
                : "border border-white/20 text-[var(--muted)] hover:bg-white/10"
            }`}
          >
            {m === "signin" ? "Sign in" : m === "signup" ? "Sign up" : "Magic link"}
          </button>
        ))}
      </div>

      {mode === "magic" ? (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-white/20 bg-black/30 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded border border-[var(--accent)] px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            Send magic link
          </button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-white/20 bg-black/30 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-white/20 bg-black/30 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded border border-[var(--accent)] px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            {mode === "signup" ? "Create account" : "Sign in with email"}
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={handleGoogle}
        className="rounded border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
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

      {notice && <p className="text-sm text-[var(--accent)]">{notice}</p>}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <p className="text-xs text-[var(--muted)]">
        All sessions use Supabase Auth (email, magic link, OAuth, anonymous).
        Enable providers in your Supabase project under Authentication.
      </p>
    </div>
  )
}
