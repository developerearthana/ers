import { createAction, createJSONAction, ActionState } from '@/lib/safe-action';
import { z } from 'zod';

describe('Safe Action Utilities', () => {
    describe('createAction', () => {
        const testSchema = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            age: z.coerce.number().min(18),
        });

        it('should successfully process valid FormData', async () => {
            const handler = jest.fn(async (data) => ({ userId: '123', ...data }));
            const action = createAction(testSchema, handler);

            const formData = new FormData();
            formData.append('name', 'John Doe');
            formData.append('email', 'john@example.com');
            formData.append('age', '25');

            const result = await action({}, formData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                userId: '123',
                name: 'John Doe',
                email: 'john@example.com',
                age: 25,
            });
            expect(result.error).toBeUndefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                age: 25,
            });
        });

        it('should return validation errors for invalid FormData', async () => {
            const handler = jest.fn();
            const action = createAction(testSchema, handler);

            const formData = new FormData();
            formData.append('name', 'J'); // Too short
            formData.append('email', 'invalid-email'); // Invalid email
            formData.append('age', '15'); // Below minimum

            const result = await action({}, formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid fields. Please check your inputs.');
            expect(result.fieldErrors).toBeDefined();
            expect(result.fieldErrors?.name).toBeDefined();
            expect(result.fieldErrors?.email).toBeDefined();
            expect(result.fieldErrors?.age).toBeDefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).not.toHaveBeenCalled();
        });

        it('should handle missing required fields', async () => {
            const handler = jest.fn();
            const action = createAction(testSchema, handler);

            const formData = new FormData();
            formData.append('name', 'John Doe');
            // Missing email and age

            const result = await action({}, formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid fields. Please check your inputs.');
            expect(result.fieldErrors).toBeDefined();
            expect(handler).not.toHaveBeenCalled();
        });

        it('should handle handler errors gracefully', async () => {
            const handler = jest.fn(async () => {
                throw new Error('Database connection failed');
            });
            const action = createAction(testSchema, handler);

            const formData = new FormData();
            formData.append('name', 'John Doe');
            formData.append('email', 'john@example.com');
            formData.append('age', '25');

            const result = await action({}, formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('An unexpected error occurred. Please try again.');
            expect(result.data).toBeUndefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).toHaveBeenCalled();
        });

        it('should handle empty FormData', async () => {
            const handler = jest.fn();
            const action = createAction(testSchema, handler);

            const formData = new FormData();
            const result = await action({}, formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid fields. Please check your inputs.');
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('createJSONAction', () => {
        const testSchema = z.object({
            title: z.string().min(3),
            description: z.string().optional(),
            priority: z.enum(['low', 'medium', 'high']),
            dueDate: z.string().datetime(),
        });

        it('should successfully process valid JSON data', async () => {
            const handler = jest.fn(async (data) => ({ taskId: 'task-123', ...data }));
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'Complete Project',
                description: 'Finish the ERP implementation',
                priority: 'high' as const,
                dueDate: '2026-01-15T10:00:00Z',
            };

            const result = await action(inputData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                taskId: 'task-123',
                ...inputData,
            });
            expect(result.error).toBeUndefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).toHaveBeenCalledWith(inputData);
        });

        it('should return validation errors for invalid JSON data', async () => {
            const handler = jest.fn();
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'AB', // Too short
                priority: 'urgent', // Invalid enum value
                dueDate: 'invalid-date',
            };

            const result = await action(inputData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation Failed');
            expect(result.fieldErrors).toBeDefined();
            expect(result.fieldErrors?.title).toBeDefined();
            expect(result.fieldErrors?.priority).toBeDefined();
            expect(result.fieldErrors?.dueDate).toBeDefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).not.toHaveBeenCalled();
        });

        it('should handle missing required fields', async () => {
            const handler = jest.fn();
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'Valid Title',
                // Missing priority and dueDate
            };

            const result = await action(inputData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation Failed');
            expect(result.fieldErrors).toBeDefined();
            expect(handler).not.toHaveBeenCalled();
        });

        it('should handle optional fields correctly', async () => {
            const handler = jest.fn(async (data) => ({ taskId: 'task-456', ...data }));
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'Task without description',
                priority: 'low' as const,
                dueDate: '2026-01-20T15:30:00Z',
                // description is optional
            };

            const result = await action(inputData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(handler).toHaveBeenCalled();
        });

        it('should handle handler errors with custom error messages', async () => {
            const handler = jest.fn(async () => {
                throw new Error('Task creation failed: Duplicate title');
            });
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'Duplicate Task',
                priority: 'medium' as const,
                dueDate: '2026-01-18T12:00:00Z',
            };

            const result = await action(inputData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Task creation failed: Duplicate title');
            expect(result.data).toBeUndefined();
            expect(result.timestamp).toBeDefined();
            expect(handler).toHaveBeenCalled();
        });

        it('should handle non-Error exceptions', async () => {
            const handler = jest.fn(async () => {
                throw 'String error'; // Non-Error exception
            });
            const action = createJSONAction(testSchema, handler);

            const inputData = {
                title: 'Test Task',
                priority: 'high' as const,
                dueDate: '2026-01-16T09:00:00Z',
            };

            const result = await action(inputData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Internal Server Error');
            expect(handler).toHaveBeenCalled();
        });

        it('should include timestamp in all responses', async () => {
            const handler = jest.fn(async (data) => data);
            const action = createJSONAction(testSchema, handler);

            const beforeTime = Date.now();
            const result = await action({
                title: 'Timestamped Task',
                priority: 'low' as const,
                dueDate: '2026-01-17T14:00:00Z',
            });
            const afterTime = Date.now();

            expect(result.timestamp).toBeDefined();
            expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(result.timestamp).toBeLessThanOrEqual(afterTime);
        });
    });
});
