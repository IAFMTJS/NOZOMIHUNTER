"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { User } from "@supabase/supabase-js"
import {
  signInAsGuest,
  signInWithEmail,
  signInWithGoogle,
  signInWithMagicLink,
  signInWithOAuth,
  signUpWithEmail,
  signOut as authSignOut,
} from "@/services/supabase/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  return {
    user,
    loading,
    configured,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithOAuth,
    signInWithGoogle,
    signInAsGuest,
    signOut: authSignOut,
  }
}
