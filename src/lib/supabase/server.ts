import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "./env"

type CookieToSet = { name: string; value: string; options?: CookieOptions }

export async function createClient(): Promise<SupabaseClient | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const cookieStore = await cookies()

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — ignore
        }
      },
    },
  })
}
