import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { TradeWebhookPayload } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TradeWebhookPayload

    // Validate required fields
    if (!body.pair || !body.timeframe || !body.direction || !body.entry) {
      return NextResponse.json({ error: "Missing required fields: pair, timeframe, direction, entry" }, { status: 400 })
    }

    // Validate direction
    if (body.direction !== "BUY" && body.direction !== "SELL") {
      return NextResponse.json({ error: "Direction must be either BUY or SELL" }, { status: 400 })
    }

    // Get the authorization header to identify the user
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Create supabase client
    const supabase = await createClient()

    // Verify the user with the token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Extract reasons from message if provided
    const reasons = body.message
      ?.split("\n")
      .find((line) => line.startsWith("Reasons:"))
      ?.replace("Reasons:", "")
      .trim()

    // Insert trade into database
    const { data: trade, error: insertError } = await supabase
      .from("trades")
      .insert({
        user_id: user.id,
        pair: body.pair,
        timeframe: body.timeframe,
        direction: body.direction,
        entry: body.entry,
        tp: body.tp,
        sl: body.sl,
        reasons: reasons || body.message,
        status: "open",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error inserting trade:", insertError)
      return NextResponse.json({ error: "Failed to create trade", details: insertError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        trade,
        message: "Trade logged successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error processing trade webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  console.log("[v0] GET /trades")
  try {
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

    // Fetch user's trades
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (tradesError) {
      return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 })
    }

    return NextResponse.json({ trades })
  } catch (error) {
    console.error("[v0] Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
