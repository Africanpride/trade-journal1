"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

export async function generateApiKey() {
    const supabase = await createClient()

    // key-xxxxxxxxxxxxxxxx
    // 16 bytes = 32 hex chars
    const keyInfo = randomBytes(16).toString("hex")
    const apiKey = `${keyInfo}`

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Upsert the API key for this user. 
    // We used 'unique(user_id)' in the table definition, so on conflict it should update.
    // Ideally, we might want to let them have multiple, but the requirement implies "an api key".
    const { data, error } = await supabase
        .from("api_keys")
        .upsert(
            {
                user_id: user.id,
                key: apiKey,
                label: "Default Key", // You could allow naming keys in the future
            },
            { onConflict: "user_id" }
        )
        .select()
        .single()

    if (error) {
        console.error("Error generating API key:", error)
        return { error: "Failed to generate API key" }
    }

    revalidatePath("/dashboard/settings")
    return { success: true, apiKey: data.key }
}

export async function getApiKey() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { data, error } = await supabase
        .from("api_keys")
        .select("key")
        .eq("user_id", user.id)
        .single()

    if (error && error.code !== "PGRST116") { // PGRST116 is 'not found'
        console.error("Error fetching API key:", error)
        return { error: "Failed to fetch API key" }
    }

    return { apiKey: data?.key || null }
}
