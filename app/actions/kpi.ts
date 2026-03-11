"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { kpiService } from "@/services/KPIService";
import { revalidatePath } from "next/cache";

// Validation
const KPIEntrySchema = z.object({
    week: z.string(),
    subsidiary: z.string(),
    metric: z.string(),
    assignee: z.string(),
    team: z.string(),
    target: z.string(),
    actual: z.string(),
    comment: z.string(),
    date: z.string(),
    goalId: z.string().optional(),
});

// Actions
export const getKPIEntries = async (filters: Record<string, unknown> = {}) => {
    try {
        const entries = await kpiService.getKPIEntries(filters);
        return { success: true, data: entries };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createKPIEntry = createJSONAction(KPIEntrySchema, async (data) => {
    try {
        await kpiService.createKPIEntry(data);
        revalidatePath("/goals/kpi");
        revalidatePath("/goals");
        revalidatePath("/goals/board");
        revalidatePath("/goals/admin");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create KPI entry" };
    }
});

export const updateKPIEntry = createJSONAction(KPIEntrySchema.extend({ id: z.string() }), async (data) => {
    try {
        await kpiService.updateKPIEntry(data.id, data);
        revalidatePath("/goals/kpi");
        revalidatePath("/goals");
        revalidatePath("/goals/board");
        revalidatePath("/goals/admin");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update KPI entry" };
    }
});

export const deleteKPIEntry = async (id: string) => {
    try {
        await kpiService.deleteKPIEntry(id);
        revalidatePath("/goals/kpi");
        revalidatePath("/goals");
        revalidatePath("/goals/board");
        revalidatePath("/goals/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const KPITemplateSchema = z.object({
    name: z.string().min(1),
    industry: z.string().optional().default('General'),
    department: z.string().min(1),
    description: z.string().optional(),
    unit: z.string().default('Count'),
    calcMethod: z.enum(['Sum', 'Average', 'Latest']).default('Sum'),
    defaultTarget: z.string().optional(),
    frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Project']).default('Monthly'),
});

export const getKPITemplates = async (filters: any = {}) => {
    try {
        const templates = await kpiService.getTemplates(filters);
        return { success: true, data: templates };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createKPITemplate = createJSONAction(KPITemplateSchema, async (data) => {
    try {
        await kpiService.createTemplate(data);
        revalidatePath("/goals/templates");
        revalidatePath("/goals/plan");
        revalidatePath("/goals/kpi");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create KPI template" };
    }
});

export const updateKPITemplate = createJSONAction(KPITemplateSchema.extend({ id: z.string() }), async (data) => {
    try {
        await kpiService.updateTemplate(data.id, data);
        revalidatePath("/goals/templates");
        revalidatePath("/goals/plan");
        revalidatePath("/goals/kpi");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update KPI template" };
    }
});

export const deleteKPITemplate = async (id: string) => {
    try {
        await kpiService.deleteTemplate(id);
        revalidatePath("/goals/templates");
        revalidatePath("/goals/plan");
        revalidatePath("/goals/kpi");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
