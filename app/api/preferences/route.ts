// app/api/preferences/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch preferences
        const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If no preferences exist, return defaults
        if (prefError || !preferences) {
            return NextResponse.json({
                enable_journalling: true,
                enable_telegram_notifications: true,
            });
        }

        return NextResponse.json({
            enable_journalling: preferences.enable_journalling,
            enable_telegram_notifications: preferences.enable_telegram_notifications,
        });
    } catch (error) {
        console.error('[PREFERENCES GET ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { enable_journalling, enable_telegram_notifications } = body;

        if (typeof enable_journalling !== 'boolean' || typeof enable_telegram_notifications !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid preference values' },
                { status: 400 }
            );
        }

        // Check if user is superadmin or admin using admin client to bypass RLS
        const { data: userData, error: userDataError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userDataError || !userData) {
            console.error('[PREFERENCES POST] Failed to fetch user role:', userDataError);
            return NextResponse.json(
                { error: 'Failed to fetch user data' },
                { status: 500 }
            );
        }

        if (userData.role !== 'superadmin' && userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Insufficient permissions. Only superadmin and admin can modify preferences.' },
                { status: 403 }
            );
        }

        // Check if preferences exist using admin client
        const { data: existing } = await supabaseAdmin
            .from('user_preferences')
            .select('id')
            .eq('user_id', user.id)
            .single();

        let result;
        if (existing) {
            // Update existing preferences using admin client
            result = await supabaseAdmin
                .from('user_preferences')
                .update({
                    enable_journalling,
                    enable_telegram_notifications,
                })
                .eq('user_id', user.id)
                .select()
                .single();
        } else {
            // Insert new preferences using admin client
            result = await supabaseAdmin
                .from('user_preferences')
                .insert({
                    user_id: user.id,
                    enable_journalling,
                    enable_telegram_notifications,
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error('[PREFERENCES UPDATE ERROR]', result.error);
            return NextResponse.json(
                { error: 'Failed to update preferences' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            preferences: result.data,
        });
    } catch (error) {
        console.error('[PREFERENCES POST ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
