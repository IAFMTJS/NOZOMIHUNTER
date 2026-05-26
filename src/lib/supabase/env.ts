const PLACEHOLDER_URL = "your-project.supabase.co"
const PLACEHOLDER_KEY = "your-anon-key"

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === "1" || normalized === "true" || normalized === "yes") return true
  if (normalized === "0" || normalized === "false" || normalized === "no") return false
  return fallback
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !key) return false
  if (url.includes(PLACEHOLDER_URL) || key === PLACEHOLDER_KEY) return false

  return true
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) return null

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  }
}

export function isGuestAuthEnabled(): boolean {
  return envFlag(process.env.NEXT_PUBLIC_ENABLE_GUEST_AUTH, false)
}
