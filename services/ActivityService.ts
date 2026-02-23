import connectToDatabase from '@/lib/db';
import Event, { IEvent } from '@/models/Event';
import { sanitizeObject } from '@/lib/sanitize';

export class ActivityService {
    /**
     * Get Events (can filter by date range later)
     */
    async getEvents() {
        await connectToDatabase();
        const events = await Event.find({})
            .sort({ start: 1 })
            .lean();

        return JSON.parse(JSON.stringify(events)).map((e: any) => ({
            id: e._id.toString(),
            title: e.title,
            start: new Date(e.start),
            end: e.end ? new Date(e.end) : undefined,
            type: e.type,
            description: e.description,
            location: e.location
        }));
    }

    /**
     * Create Event
     */
    async createEvent(data: Partial<IEvent>) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const event = await Event.create({
            ...sanitized,
            start: new Date(sanitized.start as any),
            end: sanitized.end ? new Date(sanitized.end as any) : undefined
        });
        return JSON.parse(JSON.stringify(event));
    }
}

export const activityService = new ActivityService();
