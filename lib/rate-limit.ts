/**
 * Simple in-memory rate limiter for authentication and sensitive operations
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Check if a request should be rate limited
     * @param identifier - Unique identifier (IP address, user ID, etc.)
     * @param maxRequests - Maximum number of requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns true if rate limit exceeded, false otherwise
     */
    isRateLimited(identifier: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const entry = this.requests.get(identifier);

        if (!entry || now > entry.resetTime) {
            // First request or window expired
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            return false;
        }

        if (entry.count >= maxRequests) {
            return true;
        }

        entry.count++;
        return false;
    }

    /**
     * Get remaining requests for an identifier
     */
    getRemaining(identifier: string, maxRequests: number): number {
        const entry = this.requests.get(identifier);
        if (!entry || Date.now() > entry.resetTime) {
            return maxRequests;
        }
        return Math.max(0, maxRequests - entry.count);
    }

    /**
     * Reset rate limit for an identifier
     */
    reset(identifier: string): void {
        this.requests.delete(identifier);
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.requests.entries()) {
            if (now > entry.resetTime) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * Destroy the rate limiter and cleanup interval
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.requests.clear();
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

// Preset configurations
export const RATE_LIMITS = {
    LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    API: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    SENSITIVE: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 requests per minute
};
