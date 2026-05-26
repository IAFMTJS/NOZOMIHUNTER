import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const protectedPaths = [
  "/dashboard",
  "/home",
  "/contracts",
  "/missions",
  "/dungeons",
  "/prepare",
  "/vocabulary",
  "/inventory",
  "/system",
  "/profile",
  "/stats",
  "/achievements",
  "/settings",
  "/training",
  "/records",
]

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !user && isSupabaseConfigured()) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
