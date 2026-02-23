import connectToDatabase from '@/lib/db';
import WorkOrder from '@/models/WorkOrder';
import { sanitizeObject } from '@/lib/sanitize';

export interface WorkOrderData {
    title: string;
    type: string;
    project: string;
    priority: string;
    assignee: string;
    location?: string;
    cost?: number;
    description?: string;
    status?: string;
    date?: string;
}

export class WorkOrderService {
    /**
     * Create a new work order
     */
    async createWorkOrder(data: WorkOrderData) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        // Generate custom ID if needed, but Mongo ID is fine for internal ref.
        // If UI needs "WO-2026-XXX", we can generate it or use a virtual.
        // For now, simpler to stick to Mongo ID or add a sequential field later.

        const workOrder = await WorkOrder.create({
            ...sanitized,
            date: sanitized.date ? new Date(sanitized.date) : new Date(),
        });

        return JSON.parse(JSON.stringify(workOrder));
    }

    /**
     * Get all work orders
     */
    async getWorkOrders(filters: any = {}) {
        await connectToDatabase();

        const query: any = {};
        if (filters.status) query.status = filters.status;
        if (filters.type) query.type = filters.type;

        const orders = await WorkOrder.find(query)
            .sort({ date: -1 })
            .lean();

        return JSON.parse(JSON.stringify(orders)).map((wo: any) => ({
            id: wo._id.toString(), // We can format this in UI if needed (WO-...)
            title: wo.title,
            type: wo.type,
            project: wo.project,
            priority: wo.priority,
            status: wo.status,
            assignee: wo.assignee,
            date: new Date(wo.date).toLocaleDateString('en-GB'), // Format for UI
            location: wo.location || 'N/A',
            cost: wo.cost,
            description: wo.description,
        }));
    }
}

export const workOrderService = new WorkOrderService();
