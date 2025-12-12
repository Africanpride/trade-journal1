import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Update the trade - RLS will ensure user can only update their own trades
    const { data: trade, error: updateError } = await supabase
      .from("trades")
      .update({
        status: body.status,
        exit_price: body.exit_price,
        pnl: body.pnl,
        closed_at: body.status === "closed" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
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

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Delete the trade - RLS will ensure user can only delete their own trades
    const { error: deleteError } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete trade", details: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Trade deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
