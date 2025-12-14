// app/actions/admin.ts
"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type UserRole = "user" | "admin" | "superadmin"

export interface UserWithProfile {
    id: string
    email: string
    created_at: string
    profile: {
        role: UserRole
        banned_at: string | null
        name: string | null
        telephone: string | null
        country: string | null
    } | null
}

async function checkSuperadmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    return profile?.role === "superadmin"
}

export async function getAllUsers(): Promise<{ users?: UserWithProfile[]; error?: string }> {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    try {
        // Get all auth users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) {
            console.error("Error listing users:", authError)
            return { error: "Failed to fetch users" }
        }

        // Get all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("*")

        if (profilesError) {
            console.error("Error fetching profiles:", profilesError)
            return { error: "Failed to fetch profiles" }
        }

        // Combine data
        const users: UserWithProfile[] = authData.users.map((user) => {
            const profile = profiles?.find((p) => p.user_id === user.id)
            return {
                id: user.id,
                email: user.email || "",
                created_at: user.created_at,
                profile: profile
                    ? {
                        role: profile.role as UserRole,
                        banned_at: profile.banned_at,
                        name: profile.name,
                        telephone: profile.telephone,
                        country: profile.country,
                    }
                    : null,
            }
        })

        return { users }
    } catch (error) {
        console.error("Error in getAllUsers:", error)
        return { error: "Failed to fetch users" }
    }
}

export async function banUser(userId: string) {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, banned_at: new Date().toISOString() })


    if (error) {
        console.error("Error banning user:", error)
        return { error: "Failed to ban user" }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function unbanUser(userId: string) {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, banned_at: null })


    if (error) {
        console.error("Error unbanning user:", error)
        return { error: "Failed to unban user" }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function updateUserRole(userId: string, role: UserRole) {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, role }) // Use upsert to handle missing profiles

    if (error) {
        console.error("Error updating role:", error)
        return { error: "Failed to update role" }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function updateUserEmail(userId: string, email: string) {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email })

    if (error) {
        console.error("Error updating email:", error)
        return { error: "Failed to update email" }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function deleteUser(userId: string) {
    const isSuperadmin = await checkSuperadmin()
    if (!isSuperadmin) {
        return { error: "Unauthorized" }
    }

    // Prevent self-deletion
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user?.id === userId) {
        return { error: "Cannot delete your own account" }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        console.error("Error deleting user:", error)
        return { error: "Failed to delete user" }
    }

    revalidatePath("/admin")
    return { success: true }
}
