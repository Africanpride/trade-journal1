// app/api/notify/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    try {
        // Step 1: Read raw body as text
        const rawBody = await request.text();

        console.info('[RAW REQUEST BODY RECEIVED]', {
            timestamp: new Date().toISOString(),
            ip,
            contentLength: rawBody.length,
            rawBody: rawBody.substring(0, 1000) + (rawBody.length > 1000 ? '...' : ''),
        });

        // Step 2: Try to parse JSON
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
            return new Response(
                `Invalid JSON format: ${err.message}\nReceived (first 500 chars): ${rawBody.substring(0, 500)}`,
                { status: 400 }
            );
        }

        // Step 3: Now proceed with normal logic
        const providedApiKey = body.apiKey;

        if (!providedApiKey) {
            console.warn('[AUTH FAIL] Missing apiKey', { timestamp: new Date().toISOString(), ip });
            return new Response('Unauthorized: Missing API key', { status: 401 });
        }
        // Verify against environment variable OR database
        let userId: string | null = null;

        // First check env var for backward compatibility
        if (providedApiKey === process.env.API_KEY) {
            console.info('[AUTH SUCCESS] Valid apiKey (env)', { timestamp: new Date().toISOString(), ip });
            // For env-based auth, we don't have a specific user
        } else {
            // Check database for personalApiKey
            const { data: keyData, error: keyError } = await supabaseAdmin
                .from('api_keys')
                .select('user_id')
                .eq('key', providedApiKey)
                .single();

            if (keyError || !keyData) {
                console.warn('[AUTH FAIL] Invalid apiKey', {
                    timestamp: new Date().toISOString(),
                    ip,
                    providedKeyPreview: providedApiKey.substring(0, 8) + '...',
                });
                return new Response('Unauthorized: Invalid API key', { status: 401 });
            }

            userId = keyData.user_id;
            console.info('[AUTH SUCCESS] Valid personalApiKey', { timestamp: new Date().toISOString(), ip, user_id: userId });
        }

        // Check telegram notification preference if we have a user_id
        if (userId) {
            const { data: preferences } = await supabaseAdmin
                .from('user_preferences')
                .select('enable_telegram_notifications')
                .eq('user_id', userId)
                .single();

            const telegramEnabled = preferences?.enable_telegram_notifications ?? true;

            if (!telegramEnabled) {
                console.info('[TELEGRAM DISABLED] Notification not sent', {
                    user_id: userId,
                    pair: body.pair,
                    timestamp: new Date().toISOString(),
                });
                return new Response('Telegram notifications are currently disabled', { status: 200 });
            }
        }

        const {
            message = '',
            pair,
            timeframe,
            direction,
            entry,
            tp,
            sl,
        } = body;

        const telegramText = `
*${direction.toUpperCase()} SIGNAL* 🚀

📊 *Pair:* \`${pair}\`
⏰ *Timeframe:* \`${timeframe}\`
🎯 *Entry:* \`${entry}\`
✅ *Take Profit:* \`${tp}\`
🛑 *Stop Loss:* \`${sl}\`

${message}
        `.trim();

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: telegramText,
                    parse_mode: 'Markdown',
                }),
            }
        );

        if (!telegramResponse.ok) {
            const errorText = await telegramResponse.text();
            console.error('[TELEGRAM ERROR]', {
                status: telegramResponse.status,
                error: errorText,
                timestamp: new Date().toISOString(),
            });
            return new Response('Failed to send to Telegram', { status: 500 });
        }

        console.info('[SIGNAL FORWARDED] Success', { pair, direction, entry, timestamp: new Date().toISOString() });

        return new Response('Signal received and forwarded to Telegram', { status: 200 });
    } catch (error) {
        console.error('[SERVER ERROR] Unexpected error in /notify:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });
        return new Response('Internal Server Error', { status: 500 });
    }
}