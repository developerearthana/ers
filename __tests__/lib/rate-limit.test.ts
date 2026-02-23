import rateLimiter, { RATE_LIMITS } from '@/lib/rate-limit';

describe('rateLimiter', () => {
    beforeEach(() => {
        // Reset rate limiter before each test
        rateLimiter.reset('test-identifier');
    });

    it('should allow requests within limit', () => {
        const identifier = 'test-user-1';
        const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;

        for (let i = 0; i < maxRequests; i++) {
            const isLimited = rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
            expect(isLimited).toBe(false);
        }
    });

    it('should block requests exceeding limit', () => {
        const identifier = 'test-user-2';
        const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;

        // Use up all allowed requests
        for (let i = 0; i < maxRequests; i++) {
            rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
        }

        // Next request should be blocked
        const isLimited = rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
        expect(isLimited).toBe(true);
    });

    it('should return correct remaining requests', () => {
        const identifier = 'test-user-3';
        const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;

        rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
        const remaining = rateLimiter.getRemaining(identifier, maxRequests);
        expect(remaining).toBe(maxRequests - 1);
    });

    it('should reset rate limit for identifier', () => {
        const identifier = 'test-user-4';
        const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;

        // Use up all requests
        for (let i = 0; i < maxRequests; i++) {
            rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
        }

        // Reset
        rateLimiter.reset(identifier);

        // Should be able to make requests again
        const isLimited = rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
        expect(isLimited).toBe(false);
    });
});
