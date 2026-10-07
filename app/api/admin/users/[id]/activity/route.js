import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: logs, error } = await supabaseAdmin
            .from('activity_logs')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            return Response.json({ success: false, error: 'Failed to fetch user activity' }, { status: 500 });
        }

        // Aggregate for user profile
        const topSearches = {};
        const topProducts = {};
        const trafficHours = Array(24).fill(0);

        logs.forEach(log => {
            if (log.event_type === 'search' && log.target_id) {
                topSearches[log.target_id] = (topSearches[log.target_id] || 0) + 1;
            } else if (log.event_type === 'view_product' && log.target_id) {
                const name = log.metadata?.product_name || log.target_id;
                topProducts[name] = (topProducts[name] || 0) + 1;
            } else if (log.event_type === 'session_start') {
                const hour = log.metadata?.time_of_day;
                if (hour !== undefined && hour >= 0 && hour < 24) {
                    trafficHours[hour]++;
                }
            }
        });

        const sortedSearches = Object.entries(topSearches).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
        const sortedProducts = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);

        let peakHour = 0;
        let maxTraffic = 0;
        trafficHours.forEach((count, idx) => {
            if (count > maxTraffic) {
                maxTraffic = count;
                peakHour = idx;
            }
        });

        let activeTimeStr = "Not enough data";
        if (maxTraffic > 0) {
            const ampm = peakHour >= 12 ? 'PM' : 'AM';
            const displayHour = peakHour % 12 === 0 ? 12 : peakHour % 12;
            activeTimeStr = `Usually active at ${displayHour} ${ampm}`;
        }

        return Response.json({
            success: true,
            data: {
                mostViewed: sortedProducts,
                recentSearches: sortedSearches,
                activeTime: activeTimeStr,
                rawLogs: logs.slice(0, 20) // send recent 20
            }
        });
    } catch (e) {
        return Response.json({ success: false, error: 'Internal error' }, { status: 500 });
    }
}
