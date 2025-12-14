// proxy.ts
import { updateSession } from "@/lib/supabase/proxy"
import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request)

  // If the session update triggered a redirect (e.g. /dashboard logic), respect it
  if (response.headers.get("Location")) {
    return response
  }

  const path = request.nextUrl.pathname

  // Skip checks for /banned, /auth, and static assets (handled by matcher mostly)
  if (path.startsWith("/banned") || path.startsWith("/auth")) {
    return response
  }

  // Create client to check user status
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Fetch profile to check role and ban status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, banned_at")
      .eq("user_id", user.id)
      .single()

    // 1. GLOBAL BAN CHECK
    if (profile?.banned_at) {
      return NextResponse.redirect(new URL("/banned", request.url))
    }

    // 2. ADMIN ROUTE PROTECTION
    if (path.startsWith("/admin")) {
      if (profile?.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  } else {
    // If not logged in and accessing protected routes
    // (Note: updateSession handles /dashboard, but we can double enforce or handle /admin here if updateSession misses it)
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
