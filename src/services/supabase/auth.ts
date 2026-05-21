import { createClient } from "@/lib/supabase/client"

export async function signInWithGoogle() {
  const supabase = createClient()
  const origin =
    typeof window !== "undefined" ? window.location.origin : ""

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) throw error
}

export async function signInAsGuest() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInAnonymously()
  if (error) throw error
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
