import { cn } from '@/lib/utils';

describe('Utils', () => {
    describe('cn - className merge utility', () => {
        it('should merge multiple class names', () => {
            const result = cn('class1', 'class2', 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle conditional classes', () => {
            const isActive = true;
            const isDisabled = false;

            const result = cn(
                'base-class',
                isActive && 'active',
                isDisabled && 'disabled'
            );

            expect(result).toBe('base-class active');
        });

        it('should merge Tailwind classes and resolve conflicts', () => {
            // twMerge should keep the last conflicting class
            const result = cn('px-2 py-1', 'px-4');
            expect(result).toBe('py-1 px-4');
        });

        it('should handle undefined and null values', () => {
            const result = cn('class1', undefined, 'class2', null, 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle empty strings', () => {
            const result = cn('class1', '', 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should handle arrays of classes', () => {
            const result = cn(['class1', 'class2'], 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle objects with boolean values', () => {
            const result = cn({
                'class1': true,
                'class2': false,
                'class3': true,
            });
            expect(result).toBe('class1 class3');
        });

        it('should handle complex Tailwind class conflicts', () => {
            // Test that later classes override earlier ones for the same property
            const result = cn(
                'bg-red-500 text-white',
                'bg-blue-500'
            );
            expect(result).toBe('text-white bg-blue-500');
        });

        it('should handle responsive Tailwind classes', () => {
            const result = cn(
                'text-sm md:text-base lg:text-lg',
                'text-xs'
            );
            // Should keep responsive variants and override base
            expect(result).toContain('md:text-base');
            expect(result).toContain('lg:text-lg');
        });

        it('should handle hover and state variants', () => {
            const result = cn(
                'bg-blue-500 hover:bg-blue-600',
                'focus:bg-blue-700'
            );
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('hover:bg-blue-600');
            expect(result).toContain('focus:bg-blue-700');
        });

        it('should return empty string for no arguments', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should handle single class name', () => {
            const result = cn('single-class');
            expect(result).toBe('single-class');
        });

        it('should handle mixed input types', () => {
            const result = cn(
                'base',
                ['array1', 'array2'],
                { conditional: true, hidden: false },
                undefined,
                'final'
            );
            expect(result).toContain('base');
            expect(result).toContain('array1');
            expect(result).toContain('array2');
            expect(result).toContain('conditional');
            expect(result).not.toContain('hidden');
            expect(result).toContain('final');
        });

        it('should handle duplicate classes', () => {
            const result = cn('class1', 'class2', 'class1');
            // The result should contain both classes (clsx doesn't deduplicate by default)
            expect(result).toContain('class1');
            expect(result).toContain('class2');
        });

        it('should preserve important modifier', () => {
            const result = cn('text-red-500', '!text-blue-500');
            expect(result).toContain('!text-blue-500');
        });
    });
});
