// app/api/profile/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        return NextResponse.json({ profile: profile || { name: null, telephone: null, country: null } });
    } catch (error) {
        console.error('[PROFILE GET ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, telephone, country } = await request.json();

        // Check if profile exists
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        let result;
        if (existing) {
            result = await supabase
                .from('user_profiles')
                .update({ name, telephone, country })
                .eq('user_id', user.id)
                .select()
                .single();
        } else {
            result = await supabase
                .from('user_profiles')
                .insert({ user_id: user.id, name, telephone, country })
                .select()
                .single();
        }

        if (result.error) {
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true, profile: result.data });
    } catch (error) {
        console.error('[PROFILE UPDATE ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
