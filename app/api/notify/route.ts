// app/api/notify/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
        const body = await request.json();

        const providedApiKey = body.apiKey;

        if (!providedApiKey) {
            console.warn('[AUTH FAIL] Missing apiKey', { timestamp: new Date().toISOString(), ip });
            return new Response('Unauthorized: Missing API key', { status: 401 });
        }

        // Verify against database
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

        console.info('[AUTH SUCCESS] Valid apiKey', { timestamp: new Date().toISOString(), ip, user_id: keyData.user_id });

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
            const error = await telegramResponse.text();
            console.error('[TELEGRAM ERROR]', { status: telegramResponse.status, error });
            return new Response('Failed to send to Telegram', { status: 500 });
        }

        console.info('[SIGNAL FORWARDED] Success', { pair, direction, entry });

        return new Response('Signal received and forwarded to Telegram', { status: 200 });
    } catch (error) {
        console.error('[SERVER ERROR]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}