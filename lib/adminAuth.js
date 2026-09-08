/**
 * lib/adminAuth.js
 * Shared admin authorization guard for all /api/admin/* routes.
 *
 * Usage in any admin route handler:
 *   const auth = await requireAdmin(request);
 *   if (auth.error) return auth.error;
 *   // auth.user is now the verified admin user
 */
import { verifySession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * Verifies that the incoming request has a valid session belonging to an admin user.
 *
 * @param {Request} request - The Next.js App Router request object
 * @returns {{ user: object }|{ error: NextResponse }} - On success: the admin user.
 *          On failure: a ready-to-return 401/403 NextResponse.
 */
export async function requireAdmin(request) {
    // 1. Verify session cookie
    const userId = verifySession(request);
    if (!userId) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Unauthorized: No valid session' },
                { status: 401 }
            )
        };
    }

    // 2. Validate role in the database (can't be spoofed client-side)
    if (!supabaseAdmin) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Server misconfiguration: Admin client unavailable' },
                { status: 500 }
            )
        };
    }

    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, role')
        .eq('id', userId)
        .single();

    if (error || !user) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Unauthorized: User not found' },
                { status: 401 }
            )
        };
    }

    if (user.role !== 'admin') {
        return {
            error: NextResponse.json(
                { success: false, error: 'Forbidden: Admin access required' },
                { status: 403 }
            )
        };
    }

    return { user };
}
