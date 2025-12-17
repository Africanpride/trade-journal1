// app/api/admin/users/[id]/ban/route.ts
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is superadmin
        const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleError || !userData || userData.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { ban } = await request.json();
        const targetUserId = params.id;

        // Update banned_at field
        const { error: banError } = await supabaseAdmin
            .from('users')
            .update({ banned_at: ban ? new Date().toISOString() : null })
            .eq('id', targetUserId);

        if (banError) {
            return NextResponse.json({ error: 'Failed to update ban status' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: ban ? 'User banned' : 'User unbanned' });
    } catch (error) {
        console.error('[ADMIN BAN ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
