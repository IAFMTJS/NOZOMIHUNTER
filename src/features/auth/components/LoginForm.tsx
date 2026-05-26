"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { isGuestAuthEnabled } from "@/lib/supabase/env"

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
  const guestEnabled = isGuestAuthEnabled()

  useEffect(() => {
    const code = searchParams.get("error")
    if (code && CALLBACK_ERRORS[code]) {
      setError(CALLBACK_ERRORS[code])
    }
  }, [searchParams])

  async function goToHome() {
    window.location.href = "/home"
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
        await goToHome()
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
      await goToHome()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guest sign-in failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-sm space-y-3">
        <div className="h-10 animate-pulse rounded bg-white/10" />
        <div className="h-11 animate-pulse rounded bg-white/10" />
        <div className="h-11 animate-pulse rounded bg-white/10" />
      </div>
    )
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
          <Button
            key={m}
            variant={mode === m ? "primary" : "ghost"}
            disabled={busy}
            onClick={() => {
              setMode(m)
              setError(null)
              setNotice(null)
            }}
            className={mode === m ? "!bg-[var(--accent)] !text-[var(--accent-on)]" : ""}
          >
            {m === "signin" ? "Sign in" : m === "signup" ? "Sign up" : "Magic link"}
          </Button>
        ))}
      </div>

      {mode === "magic" ? (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="md" disabled={busy}>
            Send magic link
          </Button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="md" disabled={busy}>
            {mode === "signup" ? "Create account" : "Sign in with email"}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        or
        <span className="h-px flex-1 bg-[var(--border-subtle)]" />
      </div>

      <Button variant="ghost" size="md" disabled={busy} onClick={handleGoogle}>
        Continue with Google
      </Button>
      {guestEnabled && (
        <Button variant="ghost" size="md" disabled={busy} onClick={handleGuest}>
          Enter as Guest
        </Button>
      )}

      {notice && <p className="text-sm text-[var(--accent)]">{notice}</p>}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-[var(--muted)]">
          Auth runs through Supabase providers. Enable email/OAuth and optional anonymous
          sign-in in your project settings when testing locally.
        </p>
      )}
    </div>
  )
}
