import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // AUTHENTICATION
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 })
    }

    const supabase = await createClient()

    // Verify API Key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key", apiKey)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 })
    }

    const userId = keyData.user_id

    // Update the trade - ensuring user can only update their own trades
    const { data: trade, error: updateError } = await supabase
      .from("trades")
      .update({
        status: body.status,
        exit_price: body.exit_price,
        pnl: body.pnl,
        closed_at: body.status === "closed" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", userId) // Use userId from API key
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

    // AUTHENTICATION
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 })
    }

    const supabase = await createClient()

    // Verify API Key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key", apiKey)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 })
    }

    const userId = keyData.user_id

    // Delete the trade - ensuring user can only delete their own trades
    const { error: deleteError } = await supabase.from("trades").delete().eq("id", id).eq("user_id", userId) // Use userId from API key

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete trade", details: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Trade deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
