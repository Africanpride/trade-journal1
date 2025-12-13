import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()
    let userId: string | null = null

    // 1. Try API Key Authentication
    const apiKey = request.headers.get("x-api-key")
    if (apiKey) {
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .eq("key", apiKey)
        .single()

      if (keyData) userId = keyData.user_id
    }

    // 2. Try Bearer Token Authentication (Supabase Auth)
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the trade - ensuring user can only update their own trades
    const { data: trade, error: updateError } = await supabase
      .from("trades")
      .update({
        status: body.status,
        exit_price: body.exit_price,
        pnl: body.pnl,
        closed_at: body.status === "closed" ? new Date().toISOString() : null,
        reasons: body.reasons, // Allow updating reasons
        screenshot_url: body.screenshot_url, // Allow updating screenshot
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update trade", details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, trade })
  } catch (error) {
    console.error("[v0] Error updating trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    let userId: string | null = null

    // 1. Try API Key Authentication
    const apiKey = request.headers.get("x-api-key")
    if (apiKey) {
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .eq("key", apiKey)
        .single()

      if (keyData) userId = keyData.user_id
    }

    // 2. Try Bearer Token Authentication (Supabase Auth)
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the trade - ensuring user can only delete their own trades
    const { error: deleteError } = await supabase.from("trades").delete().eq("id", id).eq("user_id", userId)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete trade", details: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Trade deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
