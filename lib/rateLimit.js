const rateLimitMap = new Map();

/**
 * Simple in-memory rate limiter for Edge/Serverless environments.
 * Note: On Vercel, this is per-instance, but still provides basic brute-force protection.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {number} limit - Max number of requests allowed in the window
 * @param {number} windowMs - The time window in milliseconds
 * @returns {object} { success: boolean, remaining: number }
 */
export function rateLimit(request, limit = 5, windowMs = 60000) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    const timestamps = rateLimitMap.get(ip);
    
    // Filter timestamps within the current window
    const windowStart = now - windowMs;
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    
    if (validTimestamps.length >= limit) {
        return { success: false, remaining: 0 };
    }
    
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    
    return { success: true, remaining: limit - validTimestamps.length };
}
