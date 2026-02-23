"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { workOrderService } from "@/services/WorkOrderService";
import { revalidatePath } from "next/cache";

// Validation
const WorkOrderSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.string(),
    project: z.string().min(1, "Project is required"),
    priority: z.string(),
    assignee: z.string().min(1, "Assignee is required"),
    location: z.string().optional(),
    cost: z.number().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
});

// Actions
export const getWorkOrders = async () => {
    try {
        const orders = await workOrderService.getWorkOrders();
        return { success: true, data: orders };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createWorkOrder = createJSONAction(WorkOrderSchema, async (data) => {
    try {
        await workOrderService.createWorkOrder(data);
        revalidatePath("/work-orders");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create work order" };
    }
});
