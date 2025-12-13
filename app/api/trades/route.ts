// app/api/trades/route.ts
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from '@/lib/supabase/admin'  // Adjust path
import { NextResponse } from "next/server"
import type { TradeWebhookPayload } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TradeWebhookPayload

    // Validate required fields
    if (!body.pair || !body.timeframe || !body.direction || !body.entry) {
      return NextResponse.json(
        { error: "Missing required fields: pair, timeframe, direction, entry" },
        { status: 400 }
      )
    }

    // Validate direction
    if (body.direction !== "BUY" && body.direction !== "SELL") {
      return NextResponse.json(
        { error: "Direction must be either BUY or SELL" },
        { status: 400 }
      )
    }

    // AUTHENTICATION
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing x-api-key header" },
        { status: 401 }
      )
    }

    console.log("API KEY RECEIVED:", apiKey);

    // Verify API Key
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("user_id")
      .eq("key", apiKey)
      .single()

    console.log("TESTING");

    if (keyError || !keyData) {
      return NextResponse.json(
        { error: keyError },
        { status: 401 }
      )
    }

    const userId = keyData.user_id

    // Extract reasons from message if provided
    const reasons = body.message
      ?.split("\n")
      .find((line) => line.startsWith("Reasons:"))
      ?.replace("Reasons:", "")
      .trim()

    // Insert trade into database
    const { data: trade, error: insertError } = await supabaseAdmin
      .from("trades")
      .insert({
        user_id: userId,
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
      return NextResponse.json(
        { error: "Failed to create trade", details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        trade,
        message: "Trade logged successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error processing trade webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET still works the same way (you can keep it or remove auth here too)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", "e85523e6-69c0-4924-9249-528aeeee11cc")
    .order("created_at", { ascending: false })

  return NextResponse.json({ trades })
}
