import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        // Fetch last 30 days of logs for aggregation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: logs, error } = await supabaseAdmin
            .from('activity_logs')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) {
            console.error('Failed to fetch logs:', error);
            return Response.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
        }

        // Aggregate Data
        const topSearches = {};
        const topProducts = {};
        const trafficHours = Array(24).fill(0);
        let notificationTraffic = 0;
        let totalSessions = 0;

        logs.forEach(log => {
            if (log.event_type === 'search' && log.target_id) {
                topSearches[log.target_id] = (topSearches[log.target_id] || 0) + 1;
            } else if (log.event_type === 'view_product' && log.target_id) {
                topProducts[log.target_id] = (topProducts[log.target_id] || 0) + 1;
            } else if (log.event_type === 'session_start') {
                totalSessions++;
                // Hour tracking
                const hour = log.metadata?.time_of_day;
                if (hour !== undefined && hour >= 0 && hour < 24) {
                    trafficHours[hour]++;
                }
                
                // Notification/Source tracking
                const source = log.target_id || log.metadata?.source;
                if (source === 'telegram_drop' || source === 'push' || source === 'notification') {
                    notificationTraffic++;
                }
            }
        });

        // Sort Top Searches
        const sortedSearches = Object.entries(topSearches)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        // Sort Top Products
        const sortedProducts = Object.entries(topProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([productId, count]) => ({ productId, count }));

        // Calculate peak hour
        let peakHour = 0;
        let maxTraffic = 0;
        trafficHours.forEach((count, idx) => {
            if (count > maxTraffic) {
                maxTraffic = count;
                peakHour = idx;
            }
        });

        const ampm = peakHour >= 12 ? 'PM' : 'AM';
        const displayHour = peakHour % 12 === 0 ? 12 : peakHour % 12;

        return Response.json({
            success: true,
            data: {
                topSearches: sortedSearches,
                topProducts: sortedProducts,
                peakTrafficHour: `${displayHour} ${ampm}`,
                notificationTrafficPct: totalSessions > 0 ? Math.round((notificationTraffic / totalSessions) * 100) : 0,
                totalSessions
            }
        });
    } catch (e) {
        return Response.json({ success: false, error: 'Internal error' }, { status: 500 });
    }
}
