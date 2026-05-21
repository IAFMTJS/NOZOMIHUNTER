const PLACEHOLDER_URL = "your-project.supabase.co"
const PLACEHOLDER_KEY = "your-anon-key"

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
