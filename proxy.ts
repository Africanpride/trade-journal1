import { updateSession } from "@/lib/supabase/proxy"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)

  // Get user from session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      console.log('[PROXY] No user found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('[PROXY] User accessing /admin:', user.id, user.email)

    // Check if user is superadmin using admin client to bypass RLS
    const { data: userData, error: roleError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[PROXY] User role data:', userData, 'Error:', roleError)

    if (!userData || userData.role !== 'superadmin') {
      console.log('[PROXY] Access denied - not superadmin. Role:', userData?.role)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    console.log('[PROXY] Access granted to /admin')
  }

  // Check if user is banned
  if (user) {
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('banned_at')
      .eq('id', user.id)
      .single()

    if (userData?.banned_at) {
      return NextResponse.redirect(new URL('/banned', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
