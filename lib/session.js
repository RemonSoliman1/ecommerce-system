/**
 * lib/session.js
 * Lightweight HTTP-only session cookie management using Node's built-in crypto.
 * No extra dependencies required.
 */
import crypto from 'crypto';

const COOKIE_NAME = '__cigar_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
    if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
    if (process.env.NODE_ENV !== 'production') {
        // Allow dev to work without env var, but warn loudly
        console.warn('[session] SESSION_SECRET is not set. Using insecure dev fallback. Set it in .env.local.');
        return 'dev-fallback-secret-replace-me-in-env';
    }
    throw new Error('SESSION_SECRET environment variable is required in production.');
}

function signToken(userId) {
    const secret = getSecret();
    const data = String(userId);
    const encoded = Buffer.from(data).toString('base64url');
    const hmac = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
    return `${encoded}.${hmac}`;
}

function verifyToken(token) {
    try {
        const secret = getSecret();
        const dotIndex = token.lastIndexOf('.');
        if (dotIndex === -1) return null;
        const encoded = token.substring(0, dotIndex);
        const hmac = token.substring(dotIndex + 1);
        const expectedHmac = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
        // Timing-safe comparison to prevent timing attacks
        if (hmac.length !== expectedHmac.length) return null;
        if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) return null;
        return Buffer.from(encoded, 'base64url').toString();
    } catch {
        return null;
    }
}

/**
 * Returns the Set-Cookie header string for a new session.
 * @param {string|number} userId
 * @param {boolean} rememberMe
 */
export function createSessionCookie(userId, rememberMe = true) {
    const token = signToken(userId);
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    let cookieStr = `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/${secure}`;
    if (rememberMe) {
        cookieStr += `; Max-Age=${COOKIE_MAX_AGE}`;
    }
    return cookieStr;
}

/**
 * Returns a Set-Cookie header string that clears the session cookie.
 */
export function clearSessionCookie() {
    return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Reads and verifies the session cookie from a Next.js request.
 * @param {Request} request
 * @returns {string|null} userId string, or null if invalid/missing
 */
export function verifySession(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const trimmed = c.trim();
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) return [trimmed, ''];
            return [trimmed.substring(0, eqIdx), trimmed.substring(eqIdx + 1)];
        })
    );
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
}
