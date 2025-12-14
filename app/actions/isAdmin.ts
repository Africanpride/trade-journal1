// app/actions/isAdmin.ts
"use server"

import { createClient } from "@/lib/supabase/server"

export async function isAdmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    return profile?.role === "admin" || profile?.role === "superadmin"
}

export async function isSuperadmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    return profile?.role === "superadmin"
}
