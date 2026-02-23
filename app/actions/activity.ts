"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { activityService } from "@/services/ActivityService";
import { revalidatePath } from "next/cache";

export const getEvents = async () => {
    try {
        const data = await activityService.getEvents();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const EventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(['Meeting', 'Task', 'Reminder', 'Holiday']),
    start: z.string().or(z.date()), // Front end sends string usually
    end: z.string().or(z.date()).optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    attendees: z.string().optional(), // Comma separated or array? Simple text for now
});

export const createEvent = createJSONAction(EventSchema, async (data) => {
    try {
        await activityService.createEvent(data as any);
        revalidatePath("/activity/calendar");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create event" };
    }
});
