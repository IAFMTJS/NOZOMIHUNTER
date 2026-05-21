import { createClient } from "@/lib/supabase/client"
import type { Provider } from "@supabase/supabase-js"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key, then restart the dev server."
    )
  }
  return supabase
}

function authRedirectUrl() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/auth/callback`
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = requireClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = requireClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirectUrl() },
  })
  if (error) throw error
}

export async function signInWithMagicLink(email: string) {
  const supabase = requireClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl() },
  })
  if (error) throw error
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = requireClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectUrl() },
  })
  if (error) throw error
}

/** @deprecated Use signInWithOAuth("google") — kept for hook compatibility */
export async function signInWithGoogle() {
  return signInWithOAuth("google")
}

export async function signInAsGuest() {
  const supabase = requireClient()
  const { error } = await supabase.auth.signInAnonymously()
  if (error) throw error
}

export async function signOut() {
  const supabase = requireClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = requireClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const supabase = requireClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
