import { sanitizeInput, sanitizeObject, sanitizeHTML } from '@/lib/sanitize';

describe('sanitize utility', () => {
    describe('sanitizeInput', () => {
        it('should remove all HTML tags by default', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello');
        });

        it('should allow specified tags', () => {
            const input = '<p>Hello <strong>World</strong></p>';
            const result = sanitizeInput(input, ['p', 'strong']);
            expect(result).toContain('Hello');
            expect(result).toContain('World');
        });

        it('should handle empty input', () => {
            expect(sanitizeInput('')).toBe('');
        });

        it('should remove dangerous attributes', () => {
            const input = '<a href="javascript:alert(1)">Click</a>';
            const result = sanitizeInput(input, ['a']);
            expect(result).not.toContain('javascript:');
        });
    });

    describe('sanitizeObject', () => {
        it('should sanitize all string properties', () => {
            const obj = {
                name: '<script>alert("xss")</script>John',
                email: 'john@example.com',
                age: 30,
            };
            const result = sanitizeObject(obj);
            expect(result.name).toBe('John');
            expect(result.email).toBe('john@example.com');
            expect(result.age).toBe(30);
        });

        it('should handle nested objects', () => {
            const obj = {
                user: {
                    name: '<b>John</b>',
                },
            };
            const result = sanitizeObject(obj);
            expect(result.user.name).toBe('John');
        });
    });

    describe('sanitizeHTML', () => {
        it('should allow safe HTML tags', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            const result = sanitizeHTML(html);
            expect(result).toContain('<p>');
            expect(result).toContain('<strong>');
        });

        it('should remove script tags', () => {
            const html = '<p>Hello</p><script>alert("xss")</script>';
            const result = sanitizeHTML(html);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Hello</p>');
        });
    });
});
