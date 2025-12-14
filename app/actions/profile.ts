// app/actions/profile.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    telephone: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export async function getProfile() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return { error: "Failed to fetch profile" }
    }

    return { profile: data }
}

export async function upsertProfile(formData: ProfileFormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Validate data
    const validation = profileSchema.safeParse(formData)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }

    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                user_id: user.id,
                name: formData.name,
                telephone: formData.telephone || null,
                country: formData.country || null,
            },
            { onConflict: "user_id" }
        )
        .select()
        .single()

    if (error) {
        console.error("Error upserting profile:", error)
        return { error: "Failed to save profile" }
    }

    revalidatePath("/dashboard/settings")
    return { success: true, profile: data }
}
