// app/api/notify/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
        const body = await request.json();

        // === AUTHENTICATION WITH LOGGING ===
        const providedApiKey = body.apiKey;

        if (!providedApiKey) {
            console.warn(
                '[AUTH FAIL] Notification attempt with MISSING apiKey',
                {
                    timestamp: new Date().toISOString(),
                    ip,
                    userAgent: request.headers.get('user-agent'),
                }
            );
            return new Response('Unauthorized: Missing API key', { status: 401 });
        }

        if (providedApiKey !== process.env.API_KEY) {
            console.warn(
                '[AUTH FAIL] Notification attempt with INVALID apiKey',
                {
                    timestamp: new Date().toISOString(),
                    ip,
                    userAgent: request.headers.get('user-agent'),
                    providedKeyPreview: providedApiKey.substring(0, 8) + '...' // Log first 8 chars only
                }
            );
            return new Response('Unauthorized: Invalid API key', { status: 401 });
        }

        // === SUCCESSFUL AUTH ===
        console.info('[AUTH SUCCESS] Valid API key from EA', {
            timestamp: new Date().toISOString(),
            ip,
        });

        const {
            message = '',
            pair,
            timeframe,
            direction,
            entry,
            tp,
            sl,
        } = body;

        // Build nice formatted message
        const telegramText = `
*${direction.toUpperCase()} SIGNAL* 🚀

📊 *Pair:* \`${pair}\`
⏰ *Timeframe:* \`${timeframe}\`
🎯 *Entry:* \`${entry}\`
✅ *Take Profit:* \`${tp}\`
🛑 *Stop Loss:* \`${sl}\`

${message}
        `.trim();

        // Send to Telegram
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
            const error = await telegramResponse.text();
            console.error('[TELEGRAM ERROR] Failed to send message:', {
                status: telegramResponse.status,
                error,
                timestamp: new Date().toISOString(),
            });
            return new Response('Failed to send to Telegram', { status: 500 });
        }

        console.info('[SIGNAL FORWARDED] Successfully sent to Telegram', {
            pair,
            direction,
            entry,
            timestamp: new Date().toISOString(),
        });

        // Your existing journal logic here (save to DB, etc.)
        // ...

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