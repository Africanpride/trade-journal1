// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase URL or service_role key')
}

// This client has full access and bypasses RLS
// Use ONLY in server-side code (API routes, server actions, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
