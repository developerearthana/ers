import { z } from "zod";

export type ActionState<T> = {
    success?: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
    timestamp?: number;
};

export const createAction = <T, S extends z.ZodType<any, any>>(
    schema: S,
    handler: (data: z.infer<S>) => Promise<T>
) => {
    return async (prevState: ActionState<T>, formData: FormData): Promise<ActionState<T>> => {
        try {
            const data = Object.fromEntries(formData.entries());
            const validatedFields = schema.safeParse(data);

            if (!validatedFields.success) {
                return {
                    success: false,
                    fieldErrors: validatedFields.error.flatten().fieldErrors,
                    error: "Invalid fields. Please check your inputs.",
                    timestamp: Date.now(),
                };
            }

            const result = await handler(validatedFields.data);

            return {
                success: true,
                data: result,
                error: undefined,
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error("Server Action Error:", error);
            return {
                success: false,
                error: "An unexpected error occurred. Please try again.",
                timestamp: Date.now(),
            };
        }
    };
};

export const createJSONAction = <T, S extends z.ZodType<any, any>>(
    schema: S,
    handler: (data: z.infer<S>) => Promise<T>
) => {
    return async (data: z.input<S>): Promise<ActionState<T>> => {
        try {
            const validatedFields = schema.safeParse(data);

            if (!validatedFields.success) {
                return {
                    success: false,
                    fieldErrors: validatedFields.error.flatten().fieldErrors,
                    error: "Validation Failed",
                    timestamp: Date.now(),
                };
            }

            const result = await handler(validatedFields.data);

            return {
                success: true,
                data: result,
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error("Server Action Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
                timestamp: Date.now(),
            };
        }
    };
};
