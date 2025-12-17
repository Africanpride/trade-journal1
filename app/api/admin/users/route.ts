// app/api/admin/users/route.ts
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is superadmin using admin client to bypass RLS
        const { data: userData, error: roleError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleError || !userData || userData.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all users using admin client to bypass RLS
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('[ADMIN USERS] Fetched users:', users?.length, 'Error:', usersError);

        if (usersError) {
            console.error('[ADMIN USERS] Error fetching users:', usersError);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('[ADMIN USERS GET ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
