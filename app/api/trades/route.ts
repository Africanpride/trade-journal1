// app/api/trades/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    console.info('[INCOMING REQUEST] /api/trades', {
      timestamp: new Date().toISOString(),
      ip,
      contentLength: rawBody.length,
      rawBodyPreview: rawBody.substring(0, 500),
    });

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      const err = parseError as Error;
      console.error('[JSON PARSE ERROR]', {
        timestamp: new Date().toISOString(),
        ip,
        error: err.message,
        rawBodyPreview: rawBody.substring(0, 300),
      });
      return NextResponse.json(
        { error: `Invalid JSON format: ${err.message}` },
        { status: 400 }
      );
    }

    const providedApiKey = body.personalApiKey;

    if (!providedApiKey) {
      return NextResponse.json(
        { error: "Missing personalApiKey in request body" },
        { status: 401 }
      );
    }

    // Verify API Key in database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("user_id")
      .eq("key", providedApiKey)
      .single();

    if (keyError || !keyData) {
      console.warn('[AUTH FAIL] Invalid apiKey for /trades', {
        timestamp: new Date().toISOString(),
        providedKeyPreview: providedApiKey.substring(0, 8) + '...',
      });
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    console.info('[AUTH SUCCESS] Valid apiKey for trade journal', {
      user_id: keyData.user_id,
      timestamp: new Date().toISOString(),
    });

    // Check journalling preference
    const { data: preferences } = await supabaseAdmin
      .from('user_preferences')
      .select('enable_journalling')
      .eq('user_id', keyData.user_id)
      .single();

    const journallingEnabled = preferences?.enable_journalling ?? true;

    if (!journallingEnabled) {
      console.info('[JOURNALLING DISABLED] Trade not logged', {
        user_id: keyData.user_id,
        pair: body.pair,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: true,
          message: 'Trade journalling is currently disabled',
        },
        { status: 200 }
      );
    }

    const { pair, timeframe, direction, entry, tp, sl, message } = body;

    // Validate required fields
    if (!pair || !timeframe || !direction || !entry) {
      return NextResponse.json(
        { error: "Missing required fields: pair, timeframe, direction, entry" },
        { status: 400 }
      );
    }

    if (!["BUY", "SELL"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction must be BUY or SELL" },
        { status: 400 }
      );
    }

    // Extract reasons
    const reasons = message
      ?.split("\n")
      .find((line: string) => line.startsWith("Reasons:"))
      ?.replace("Reasons:", "")
      .trim() || message;

    // Insert trade
    const { data: trade, error: insertError } = await supabaseAdmin
      .from("trades")
      .insert({
        user_id: keyData.user_id,
        pair,
        timeframe,
        direction,
        entry,
        tp,
        sl,
        reasons,
        status: "open",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[TRADE INSERT ERROR]", insertError);
      return NextResponse.json(
        { error: "Failed to log trade", details: insertError.message },
        { status: 500 }
      );
    }

    console.info('[TRADE JOURNALED]', { pair, direction, entry, trade_id: trade.id });

    return NextResponse.json(
      {
        success: true,
        trade,
        message: "Trade logged successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[TRADES ENDPOINT ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}