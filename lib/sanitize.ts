import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @param allowedTags - Optional array of allowed HTML tags
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, allowedTags?: string[]): string {
    if (!input) return '';

    const config = allowedTags
        ? { ALLOWED_TAGS: allowedTags }
        : { ALLOWED_TAGS: [] }; // Strip all HTML by default

    return DOMPurify.sanitize(input, config);
}

/**
 * Sanitizes an object's string properties
 * @param obj - Object with string properties to sanitize
 * @returns Object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeInput(sanitized[key]) as any;
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            const val = sanitized[key];
            if (Object.prototype.toString.call(val) === '[object Date]') {
                continue;
            }
            sanitized[key] = sanitizeObject(val);
        }
    }

    return sanitized;
}

/**
 * Sanitizes HTML content while preserving safe formatting
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHTML(html: string): string {
    const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'];
    const ALLOWED_ATTR = ['href', 'target'];

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
    });
}
