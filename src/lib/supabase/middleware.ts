import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseConfig } from "./env"

type CookieToSet = { name: string; value: string; options?: CookieOptions }

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })
  const config = getSupabaseConfig()

  if (!config) {
    return { response: supabaseResponse, user: null }
  }

  let response = supabaseResponse

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
